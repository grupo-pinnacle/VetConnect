export interface SpeciesBreeds {
  species: string;
  breeds: string[];
}

export const SPECIES_CATALOG: Record<string, string[]> = {
  Perro: [
    "Mestizo / Criollo",
    "Golden Retriever",
    "Labrador Retriever",
    "Pastor Alemán",
    "Caniche / Poodle",
    "Bulldog Francés",
    "Bulldog Inglés",
    "Beagle",
    "Boxer",
    "Rottweiler",
    "Doberman",
    "Yorkshire Terrier",
    "Schnauzer Miniatura",
    "Schnauzer Mediano / Gigante",
    "Dachshund (Salchicha)",
    "Border Collie",
    "Boyero de Berna",
    "Husky Siberiano",
    "Jack Russell Terrier",
    "Pomerania (Spitz)",
    "Dogo Argentino",
    "Pitbull Terrier",
    "Staffordshire Bull Terrier",
    "Shih Tzu",
    "Bichón Maltés",
    "Bichón Frisé",
    "Gran Danés",
    "San Bernardo",
    "Cocker Spaniel",
    "Chihuahua",
    "Pug / Carlino",
    "Shiba Inu",
    "Akita Inu",
    "Basset Hound",
    "Weimaraner",
    "Braco Alemán / Vizsla",
    "Galgo / Greyhound",
    "Dálmata",
    "Bull Terrier",
    "Chow Chow",
    "Boston Terrier",
    "Cane Corso",
    "Shar Pei",
    "Pastor Belga Malinois",
    "Pastor Australiano",
    "Samoyedo",
    "Cavalier King Charles",
    "Corgi Pembroke",
    "Basenji",
    "Mastín Napolitano",
    "Fox Terrier",
    "Pointer",
    "Setter Irlandés",
    "Terranova",
    "Alano Español",
    "Otra raza canina",
  ],
  Gato: [
    "Mestizo / Común Europeo",
    "Siamés",
    "Persa",
    "Maine Coon",
    "Bengalí",
    "Ragdoll",
    "British Shorthair",
    "Sphynx (Sin pelo)",
    "Bosque de Noruega",
    "Azul Ruso",
    "Angora Turco",
    "Abisinio",
    "Sagrado de Birmania",
    "Scottish Fold",
    "American Shorthair",
    "Bombay",
    "Siberiano",
    "Oriental de Pelo Corto",
    "Cornish Rex / Devon Rex",
    "Cartujo (Chartreux)",
    "Himalayo",
    "Balinés",
    "Mau Egipcio",
    "Somali",
    "Manx",
    "Otra raza felina",
  ],
  Conejo: [
    "Mestizo",
    "Enano Holandés",
    "Belier / Mini Lop (Orejas caídas)",
    "Cabeza de León (Lionhead)",
    "Angora",
    "Mini Rex",
    "Neozelandés",
    "Californiano",
    "Gigante de Flandes",
    "Hotot",
    "Mariposa (Papillon)",
    "Chinchilla (Conejo)",
    "Otro conejo",
  ],
  Hurón: [
    "Hurón Sable",
    "Hurón Albino",
    "Hurón Champagne",
    "Hurón Silver / Plateado",
    "Hurón Black Self",
    "Hurón Panda / Blaze",
    "Otro hurón",
  ],
  Ave: [
    "Cotorra Argentina / Monje",
    "Canario",
    "Periquito Australiano",
    "Ninfa / Carolina",
    "Agapornis (Inseparable)",
    "Loro Hablador (Amazona)",
    "Cacatúa",
    "Guacamayo",
    "Diamante Mandarín",
    "Jilguero",
    "Cardo / Cardenal",
    "Otra especie de ave",
  ],
  "Cobayo / Hámster": [
    "Cobayo Americano (Pelo corto)",
    "Cobayo Abisinio",
    "Cobayo Peruano (Pelo largo)",
    "Hámster Sirio / Dorado",
    "Hámster Ruso",
    "Hámster Roborovski",
    "Chinchilla Doméstica",
    "Jerbo",
    "Degu",
    "Otro roedor",
  ],
  Reptil: [
    "Tortuga de Tierra",
    "Tortuga de Agua (Orejas rojas)",
    "Dragón Barbudo (Pogona)",
    "Gecko Leopardo",
    "Camaleón",
    "Iguana Verde",
    "Serpiente del Maíz",
    "Pitón Bola",
    "Otro reptil",
  ],
  Caballo: [
    "Criollo Argentino",
    "Pura Sangre de Carrera (SPC)",
    "Cuarto de Milla",
    "Árabe",
    "Silla Argentino",
    "Polo Argentino",
    "Frisón",
    "Percherón",
    "Appaloosa",
    "Pony / Falabella",
    "Otro equino",
  ],
  Otro: [
    "Mestizo / Sin especificar",
    "Exótico de compañía",
    "Otra raza o especie",
  ],
};

export const SPECIES_LIST = Object.keys(SPECIES_CATALOG);

export function getBreedsForSpecies(species: string): string[] {
  const match = Object.keys(SPECIES_CATALOG).find(
    (k) => k.toLowerCase() === species.trim().toLowerCase()
  );
  return match ? SPECIES_CATALOG[match] : SPECIES_CATALOG["Otro"];
}

export function compressImageFile(file: File, maxDim = 500, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
