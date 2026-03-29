const STORAGE_KEY = 'zoo_favourites';

export interface FavouriteAnimal {
  id: string;
  name: string;
  title: string;
  page: string;
  image: string;
}

export function getFavourites(): FavouriteAnimal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavouriteAnimal[]) : [];
  } catch {
    return [];
  }
}

export function isFavourite(id: string): boolean {
  return getFavourites().some(a => a.id === id);
}

export function toggleFavourite(animal: FavouriteAnimal): boolean {
  const list = getFavourites();
  const idx = list.findIndex(a => a.id === animal.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return false;
  } else {
    list.push(animal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
}
