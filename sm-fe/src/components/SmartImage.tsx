import { useState, type ImgHTMLAttributes } from 'react';

/**
 * jpg <-> jpeg 확장자 자동 폴백 이미지.
 * 지정한 src 로드 실패 시 확장자를 한 번 바꿔 재시도한다(예: .jpeg → .jpg).
 * 파일 업로드 시 확장자를 정확히 맞추지 않아도 표시되도록 한다.
 */
export function SmartImage({ src, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [current, setCurrent] = useState(src);
  const [swapped, setSwapped] = useState(false);

  return (
    <img
      {...props}
      src={current}
      onError={(e) => {
        if (!swapped && typeof current === 'string') {
          const alt = current.endsWith('.jpeg')
            ? current.replace(/\.jpeg$/, '.jpg')
            : current.endsWith('.jpg')
              ? current.replace(/\.jpg$/, '.jpeg')
              : null;
          if (alt) {
            setSwapped(true);
            setCurrent(alt);
            return;
          }
        }
        onError?.(e);
      }}
    />
  );
}
