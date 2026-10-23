// Catalogue snapshots retain root-relative image paths. Resolve them beneath
// the app base so project Pages and root-domain hosting use the same build.
export function assetUrl(value,base='./'){
  if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//'))return value;
  return base+value.slice(1);
}
