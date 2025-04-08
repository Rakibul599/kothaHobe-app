function getUrlimg(name:string)
{
    return new URL(`../assets/icon/${name}`,import.meta.url).href
}
export {getUrlimg}