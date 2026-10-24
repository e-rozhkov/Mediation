import { useState } from "react";
export function ContentImage({
  image,
  priority = false,
  retry = true,
}: {
  image: { src: string; alt: string };
  priority?: boolean;
  retry?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return (
    <figure className="content-image">
      {failed ? (
        <div role="status" className="image-fallback">
          <p>Иллюстрация пока не загрузилась. Текст материала доступен.</p>
          {retry && (
            <button
              className="button"
              onClick={() => {
                setAttempt((x) => x + 1);
                setFailed(false);
              }}
            >
              Загрузить картинку снова
            </button>
          )}
        </div>
      ) : (
        <img
          key={attempt}
          src={image.src}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          width="1536"
          height="1024"
          onError={() => setFailed(true)}
        />
      )}
    </figure>
  );
}
