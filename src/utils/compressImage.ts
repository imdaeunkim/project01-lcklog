// 사진을 올리기 전에 브라우저에서 줄임. 긴 변 최대 1920px, JPEG로 다시 저장
// 다시 그리면 촬영 위치(GPS) 같은 사진 정보도 빠짐

const MAX_SIDE = 1920;
const QUALITIES = [0.85, 0.7, 0.55]; // 1MB를 넘으면 차례로 화질을 낮춤
const SHRINK_STEP = 0.75; // 가장 낮은 화질로도 넘으면 크기를 이 비율로 더 줄임
const MIN_SIDE = 480; // 이보다 작게는 줄이지 않음

// canvas 내용을 JPEG 파일 데이터로. 실패하면 null
function toJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

// 사진 파일을 maxBytes 이하로 줄여서 돌려줌.
// 이미 작으면 그대로 반환. GIF는 움직임이 사라지므로 줄이지 않음(호출하는 쪽에서 크기 검사).
// 사진을 열 수 없거나 끝까지 줄여도 넘으면 에러 발생
export async function compressImage(file: File, maxBytes: number): Promise<File> {
  if (file.size <= maxBytes || file.type === 'image/gif') return file;

  // 휴대폰 사진의 회전 정보를 반영해서 엶 (옆으로 눕지 않게)
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas를 쓸 수 없음');

    while (true) {
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      // PNG의 투명한 부분이 JPEG에서 검게 나오지 않게 흰 바탕을 먼저 칠함
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const blob = await toJpegBlob(canvas, quality);
        if (blob && blob.size <= maxBytes) {
          const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          return new File([blob], name, { type: 'image/jpeg' });
        }
      }

      if (Math.max(canvas.width, canvas.height) * SHRINK_STEP < MIN_SIDE) {
        throw new Error('사진을 충분히 줄이지 못함');
      }
      scale *= SHRINK_STEP;
    }
  } finally {
    bitmap.close(); // 사진 메모리 해제
  }
}
