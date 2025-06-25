function formatCustomDate(isoString) {
    const date = new Date(isoString);
  
    
    date.setHours(date.getHours() + 6);
  
    const pad = (n) => String(n).padStart(2, '0');
  
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); 
    const year = String(date.getFullYear()).slice(-2); 
  
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

  export {formatCustomDate}
  