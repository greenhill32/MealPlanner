interface Props {
  emoji: string;
  photo: string | null;
  name?: string;
  size: 40 | 44 | 56;
}

export function MealThumb({ emoji, photo, name = "", size }: Props) {
  if (photo) {
    return <img className={`thumb-${size}`} src={photo} alt={name} />;
  }
  return <div className={`thumb-emoji-${size}`}>{emoji}</div>;
}
