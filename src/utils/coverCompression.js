const MAX_SOURCE = 10 * 1024 * 1024;
const MAX_OUTPUT = 256 * 1024;
const TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function coverError(message, cause) {
  return new Error(message, cause ? { cause } : undefined);
}

// data: is allowed by the site's CSP; blob: image URLs are not.
function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(coverError('读取图片失败，请重新选择文件', reader.error));
    reader.onabort = () => reject(coverError('读取图片已取消'));
    reader.onload = () => {
      const image = new Image();
      const message = '图片解码失败，文件可能已损坏或不是有效图片';
      if (typeof image.decode === 'function') {
        image.src = reader.result;
        image.decode().then(() => resolve(image), error => reject(coverError(message, error)));
      } else {
        image.onload = () => resolve(image);
        image.onerror = event => reject(coverError(message, event));
        image.src = reader.result;
      }
    };
    try { reader.readAsDataURL(file); } catch (error) { reject(coverError('读取图片失败，请重新选择文件', error)); }
  });
}

function encode(canvas, quality) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => {
        if (!blob) reject(coverError('图片编码失败，请更换浏览器或图片后重试'));
        else if (!TYPES.includes(blob.type)) reject(coverError('浏览器生成了不支持的图片格式'));
        else resolve(blob);
      }, 'image/webp', quality);
    } catch (error) { reject(coverError('图片编码失败，请更换浏览器或图片后重试', error)); }
  });
}

export async function compressCover(file) {
  if (!TYPES.includes(file.type)) throw coverError('图片格式不支持，请选择 PNG、JPEG 或 WebP');
  if (file.size > MAX_SOURCE) throw coverError('图片文件超过 10MB，请选择更小的图片');
  const image = await readImage(file);
  if (!image.naturalWidth || !image.naturalHeight) throw coverError('图片解码失败，无法读取图片尺寸');
  if (image.naturalWidth * image.naturalHeight > 50000000) throw coverError('图片尺寸过大，请先缩小图片');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw coverError('浏览器无法处理图片，请更换浏览器后重试');
  let ratio = Math.min(1, 1280 / image.naturalWidth, 900 / image.naturalHeight);
  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    try { context.drawImage(image, 0, 0, canvas.width, canvas.height); }
    catch (error) { throw coverError('图片绘制失败，请更换图片后重试', error); }
    for (const quality of [0.84, 0.7, 0.55, 0.4]) {
      const blob = await encode(canvas, quality);
      if (blob.size <= MAX_OUTPUT) return blob;
    }
    if (canvas.width === 1 && canvas.height === 1) break;
    ratio *= 0.7;
  }
  throw coverError('图片压缩后仍超过 256KB，请选择其他图片');
}
