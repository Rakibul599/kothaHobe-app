import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Linking,
  StatusBar,
  BackHandler,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

const socket = io(API_URL, {
  withCredentials: true,
});

const isImageFile = (filenameOrUrl: string) => {
  if (!filenameOrUrl) return false;
  const lower = filenameOrUrl.toLowerCase();
  return (
    lower.includes("image") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg") ||
    lower.startsWith("data:image/")
  );
};

export default function HomeScreen({ route, navigation }: any) {
  const { user } = route.params || {};
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedCon, setSelectedCon] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  // Local Conversation Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Add User / Search User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // Selected Attachment State (Image or Document)
  const [selectedAttachment, setSelectedAttachment] = useState<{
    uri: string;
    name: string;
    type: string;
    isImage: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);

  // Edit Message Modal state
  const [editingMsg, setEditingMsg] = useState<{ id: string; text: string } | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // 1. Hardware Back Button Listener (Messenger Style)
  useEffect(() => {
    const onBackPress = () => {
      if (selectedFullImage) {
        setSelectedFullImage(null);
        return true; // handled
      }
      if (showAddUserModal) {
        setShowAddUserModal(false);
        return true; // handled
      }
      if (selectedCon) {
        setSelectedCon(null);
        return true; // handled - go back to conversation list!
      }
      return false; // let default hardware back action happen (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [selectedCon, selectedFullImage, showAddUserModal]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/chats/conversationitem`, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.conversation) {
        setConversations(response.data.conversation);
      }
    } catch (error) {
      console.log('Error fetching conversations:', error);
    }
  };

  const selectConversation = async (item: any) => {
    setSelectedCon(item);
    const conId = item._id;
    try {
      const response = await axios.get(`${API_URL}/chats/messages/${conId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setMessages(response.data);
      }
    } catch (error) {
      console.log('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    socket.on('new_message', (data: any) => {
      if (selectedCon && data.message.conversation_id === selectedCon._id) {
        setMessages((prev) => [
          ...prev,
          {
            _id: data.message._id || Date.now().toString(),
            text: data.message.message,
            attachment: data.message.attachment,
            is_deleted: data.message.is_deleted || false,
            sender: { id: data.message.sender.id },
          },
        ]);
      }
      fetchConversations();
    });

    socket.on('message_deleted', (data: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.message_id
            ? { ...m, is_deleted: true, text: '', attachment: [] }
            : m
        )
      );
    });

    socket.on('message_edited', (data: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, text: data.text } : m))
      );
    });

    return () => {
      socket.off('new_message');
      socket.off('message_deleted');
      socket.off('message_edited');
    };
  }, [selectedCon]);

  // Search User Handler
  const handleSearchUsers = async (query: string) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchingUser(true);
    try {
      const response = await axios.post(
        `${API_URL}/chats/adduser`,
        { name: query },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setSearchResults(response.data || []);
      }
    } catch (error) {
      console.log('Search user error:', error);
    } finally {
      setIsSearchingUser(false);
    }
  };

  // Add / Start Conversation with user
  const handleAddUserConversation = async (targetUser: any) => {
    try {
      await axios.post(
        `${API_URL}/chats/chatconversion`,
        { _id: targetUser._id },
        { withCredentials: true }
      );
      await fetchConversations();
      setShowAddUserModal(false);
      setUserSearchQuery('');
      setSearchResults([]);

      // Select new conversation
      const partnerName = targetUser.name;
      const match = conversations.find(
        (c) =>
          c.participant?.name === partnerName || c.creator?.name === partnerName
      );
      if (match) {
        selectConversation(match);
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setShowAddUserModal(false);
        // Find existing conversation and open
        const partnerName = targetUser.name;
        const match = conversations.find(
          (c) =>
            c.participant?.name === partnerName || c.creator?.name === partnerName
        );
        if (match) selectConversation(match);
      } else {
        Alert.alert('Notice', 'Could not add conversation');
      }
    }
  };

  // Pick Image (compressed down to ~200-300KB)
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      setSelectedAttachment({
        uri: asset.uri,
        name: filename,
        type,
        isImage: true,
      });
    }
  };

  // Pick Document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const doc = result.assets[0];
        const isImg = doc.mimeType?.startsWith('image/') || isImageFile(doc.name);
        setSelectedAttachment({
          uri: doc.uri,
          name: doc.name,
          type: doc.mimeType || 'application/octet-stream',
          isImage: !!isImg,
        });
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedAttachment) return;

    if (!selectedCon) {
      Alert.alert('Notice', 'Please select a conversation first');
      return;
    }

    const formData = new FormData();
    if (inputText.trim()) {
      formData.append('message', inputText);
    }

    const conInfo = {
      con_id: selectedCon._id,
      id: selectedCon.participant?.id || selectedCon.creator?.id,
      name: selectedCon.participant?.name || selectedCon.creator?.name,
    };
    formData.append('conversationInfo', JSON.stringify(conInfo));

    if (selectedAttachment) {
      formData.append('attachment', {
        uri: selectedAttachment.uri,
        name: selectedAttachment.name,
        type: selectedAttachment.type,
      } as any);
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/chats/sendmessage`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setInputText('');
      setSelectedAttachment(null);
    } catch (error) {
      console.log('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unsend / Delete Message
  const handleUnsendMsg = async (msgId: string) => {
    try {
      await axios.delete(`${API_URL}/chats/message/${msgId}`, {
        withCredentials: true,
      });
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, is_deleted: true, text: '', attachment: [] } : m
        )
      );
    } catch (error) {
      console.log('Error deleting message:', error);
      Alert.alert('Error', 'Could not unsend message');
    }
  };

  // Edit Message submit
  const handleSaveEditMsg = async () => {
    if (!editingMsg || !editingMsg.text.trim()) return;
    try {
      await axios.put(
        `${API_URL}/chats/message/${editingMsg.id}`,
        { text: editingMsg.text },
        { withCredentials: true }
      );
      setMessages((prev) =>
        prev.map((m) => (m._id === editingMsg.id ? { ...m, text: editingMsg.text } : m))
      );
      setEditingMsg(null);
    } catch (error) {
      console.log('Error editing message:', error);
      Alert.alert('Error', 'Could not edit message');
    }
  };

  // Save Image to Mobile Gallery
  const handleSaveImageToGallery = async (imgUrl: string) => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Storage permission required to save photos');
        return;
      }

      const filename = `kothahobe_${Date.now()}.jpg`;
      const fileUri = ((FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '') + filename;
      const downloadRes = await FileSystem.downloadAsync(imgUrl, fileUri);

      await MediaLibrary.createAssetAsync(downloadRes.uri);
      Alert.alert('Success 🎉', 'Image saved to your Phone Gallery!');
    } catch (err) {
      console.log('Save image error:', err);
      Alert.alert('Error', 'Failed to save image to gallery');
    }
  };

  // Long press / tap options on message
  const handleMessagePress = (item: any) => {
    const isMyMsg = item.sender?.id === user?.userid;
    if (!isMyMsg || !item._id || item.is_deleted) return;

    const options = [];
    if (item.text) {
      options.push({
        text: '✏️ Edit Message',
        onPress: () => setEditingMsg({ id: item._id, text: item.text }),
      });
    }
    options.push({
      text: '🗑️ Unsend Message',
      style: 'destructive' as const,
      onPress: () => handleUnsendMsg(item._id),
    });
    options.push({ text: 'Cancel', style: 'cancel' as const });

    Alert.alert('Message Options', 'Choose an action', options);
  };

  // Filter conversations locally
  const filteredConversations = conversations.filter((item) => {
    const partnerName =
      item.participant?.name || item.creator?.name || '';
    return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Clean Top Header (Safe area padded) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
          />
          <Text style={styles.headerTitle}>KothaHobe!</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {!selectedCon ? (
        // Conversation List View
        <View style={styles.conListContainer}>
          {/* Action Row: Title + Add User Button */}
          <View style={styles.topActionRow}>
            <Text style={styles.sectionTitle}>Chats</Text>
            <TouchableOpacity
              style={styles.addUserBtn}
              onPress={() => setShowAddUserModal(true)}
            >
              <Text style={styles.addUserBtnText}>+ Add User</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchBarInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {filteredConversations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matching user found' : 'No conversations yet'}
              </Text>
              <TouchableOpacity
                style={styles.startNewChatBtn}
                onPress={() => setShowAddUserModal(true)}
              >
                <Text style={styles.startNewChatText}>🔍 Search & Add User</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredConversations}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.conItem}
                  onPress={() => selectConversation(item)}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {(item.participant?.name || item.creator?.name || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.conTextContainer}>
                    <Text style={styles.conName}>
                      {item.participant?.name || item.creator?.name}
                    </Text>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {item.lastMessageText || 'Tap to start chatting'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : (
        // Chat View
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backBtnTouch}
              onPress={() => setSelectedCon(null)}
            >
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.chatHeaderName} numberOfLines={1}>
              {selectedCon.participant?.name || selectedCon.creator?.name}
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item._id || index.toString()}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMyMsg = item.sender?.id === user?.userid;
              const isDeleted = item.is_deleted;

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onLongPress={() => handleMessagePress(item)}
                  style={[
                    styles.msgBubble,
                    isDeleted
                      ? styles.deletedBubble
                      : isMyMsg
                      ? styles.myMsg
                      : styles.theirMsg,
                    isDeleted && isMyMsg ? { alignSelf: 'flex-end' } : null,
                  ]}
                >
                  {isDeleted ? (
                    <Text style={styles.deletedText}>
                      🚫 {isMyMsg ? 'You unsent a message' : 'Unsent a message'}
                    </Text>
                  ) : (
                    <>
                      {item.text ? (
                        <Text style={isMyMsg ? styles.myMsgText : styles.theirMsgText}>
                          {item.text}
                        </Text>
                      ) : null}

                      {item.attachment && item.attachment.length > 0 ? (
                        <View style={{ marginTop: 4 }}>
                          {item.attachment.map((att: string, idx: number) => {
                            const fileUrl = att.startsWith('http')
                              ? att
                              : `${API_URL}/uploads/avatars/${att}`;

                            if (isImageFile(att)) {
                              return (
                                <TouchableOpacity
                                  key={idx}
                                  activeOpacity={0.9}
                                  onPress={() => setSelectedFullImage(fileUrl)}
                                >
                                  <Image
                                    source={{ uri: fileUrl }}
                                    style={styles.msgImage}
                                    resizeMode="cover"
                                  />
                                </TouchableOpacity>
                              );
                            } else {
                              return (
                                <TouchableOpacity
                                  key={idx}
                                  style={styles.fileBubble}
                                  onPress={() => Linking.openURL(fileUrl)}
                                >
                                  <Text style={styles.fileIcon}>📄</Text>
                                  <Text style={styles.fileNameText} numberOfLines={1}>
                                    {att.split('/').pop()}
                                  </Text>
                                </TouchableOpacity>
                              );
                            }
                          })}
                        </View>
                      ) : null}
                    </>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          {/* Attachment Preview Bar */}
          {selectedAttachment ? (
            <View style={styles.previewBar}>
              <View style={styles.previewContent}>
                {selectedAttachment.isImage ? (
                  <Image
                    source={{ uri: selectedAttachment.uri }}
                    style={styles.previewThumb}
                  />
                ) : (
                  <View style={styles.docIconBox}>
                    <Text style={styles.docIconText}>📄</Text>
                  </View>
                )}
                <View style={styles.previewTextContainer}>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {selectedAttachment.name}
                  </Text>
                  <Text style={styles.previewSub}>Ready to send</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removePreviewBtn}
                onPress={() => setSelectedAttachment(null)}
              >
                <Text style={styles.removePreviewText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
              <Text style={styles.attachIcon}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={pickDocument}>
              <Text style={styles.attachIcon}>📁</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Add User / Search User Modal (Web style) */}
      <Modal
        visible={showAddUserModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddUserModal(false)}
      >
        <View style={styles.addUserModalOverlay}>
          <View style={styles.addUserModalCard}>
            <View style={styles.addUserModalHeader}>
              <Text style={styles.addUserModalTitle}>Search & Add User</Text>
              <TouchableOpacity
                onPress={() => setShowAddUserModal(false)}
                style={styles.addUserCloseBtn}
              >
                <Text style={styles.addUserCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addUserSearchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.addUserSearchInput}
                placeholder="Type name or email to search..."
                value={userSearchQuery}
                onChangeText={handleSearchUsers}
                placeholderTextColor="#94A3B8"
                autoFocus
              />
            </View>

            {isSearchingUser ? (
              <View style={styles.modalLoadingBox}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.modalLoadingText}>Searching users...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.modalEmptyBox}>
                <Text style={styles.modalEmptyText}>
                  {userSearchQuery ? 'No user found' : 'Enter name or email above'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                style={{ maxHeight: 280 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.userResultItem}
                    onPress={() => handleAddUserConversation(item)}
                  >
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {(item.name || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userResultName}>{item.name}</Text>
                      <Text style={styles.userResultEmail}>{item.email}</Text>
                    </View>
                    <Text style={styles.chatStartTag}>+ Chat</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Fullscreen Image Lightbox Modal */}
      {selectedFullImage ? (
        <Modal
          visible={!!selectedFullImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedFullImage(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalTopBar}>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => handleSaveImageToGallery(selectedFullImage)}
              >
                <Text style={styles.modalSaveText}>⬇ Save Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedFullImage(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: selectedFullImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      ) : null}

      {/* Edit Message Modal */}
      {editingMsg ? (
        <Modal
          visible={!!editingMsg}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditingMsg(null)}
        >
          <View style={styles.editModalOverlay}>
            <View style={styles.editModalCard}>
              <Text style={styles.editModalTitle}>Edit Message</Text>
              <TextInput
                style={styles.editModalInput}
                value={editingMsg.text}
                onChangeText={(t) => setEditingMsg({ ...editingMsg, text: t })}
                multiline
              />
              <View style={styles.editModalBtnRow}>
                <TouchableOpacity
                  style={styles.editModalCancelBtn}
                  onPress={() => setEditingMsg(null)}
                >
                  <Text style={styles.editModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editModalSaveBtn}
                  onPress={handleSaveEditMsg}
                >
                  <Text style={styles.editModalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 28 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  conListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  addUserBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addUserBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginBottom: 12,
  },
  startNewChatBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startNewChatText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  conItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  conTextContainer: {
    flex: 1,
  },
  conName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  lastMsg: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtnTouch: {
    paddingRight: 12,
  },
  backText: {
    fontSize: 17,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
  },
  msgBubble: {
    maxWidth: '78%',
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 12,
  },
  myMsg: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
  },
  theirMsg: {
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  deletedBubble: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  deletedText: {
    color: '#64748B',
    fontStyle: 'italic',
    fontSize: 13,
  },
  myMsgText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  theirMsgText: {
    color: '#0F172A',
    fontSize: 15,
  },
  msgImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
    marginTop: 6,
  },
  fileBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  fileIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  fileNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 12,
    marginBottom: 6,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  docIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docIconText: {
    fontSize: 22,
  },
  previewTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  previewName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  previewSub: {
    fontSize: 11,
    color: '#64748B',
  },
  removePreviewBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removePreviewText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  attachBtn: {
    padding: 6,
  },
  attachIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    marginHorizontal: 4,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addUserModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  addUserModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  addUserModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addUserModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  addUserCloseBtn: {
    backgroundColor: '#E2E8F0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUserCloseText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addUserSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  addUserSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  modalLoadingBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalLoadingText: {
    marginLeft: 8,
    color: '#64748B',
  },
  modalEmptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  modalEmptyText: {
    color: '#94A3B8',
  },
  userResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  userResultEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  chatStartTag: {
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTopBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '95%',
    height: '80%',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  editModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  editModalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  editModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editModalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  editModalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  editModalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  editModalSaveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
