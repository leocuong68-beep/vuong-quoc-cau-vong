// After `npm run build:public`: point the share preview at the public address and banner.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist-public/index.html';
const url = 'https://www.leocuong.com/rainbow/';
const html = readFileSync(file, 'utf8')
  .replaceAll('https://leocuong68-beep.github.io/vuong-quoc-cau-vong/img/banner-share.jpg', url + 'img/banner-share-public.jpg')
  .replaceAll('https://leocuong68-beep.github.io/vuong-quoc-cau-vong/', url)
  .replace('Học toán · Tiếng Anh · Sáng tạo cùng gia đình Mia', 'Học toán · Tiếng Anh · Sáng tạo cho bé')
  .replace('cùng gia đình Mia và Pony.', 'cùng Pony và các bạn.');
writeFileSync(file, html);
console.log('public meta ok');
