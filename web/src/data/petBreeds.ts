export interface SpeciesBreeds {
  species: string;
  breeds: string[];
}

export interface WeightRange {
  minPossibleKg: number;
  maxPossibleKg: number;
  idealMinKg: number;
  idealMaxKg: number;
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

export const SPECIES_WEIGHT_LIMITS: Record<string, WeightRange> = {
  Perro: { minPossibleKg: 0.3, maxPossibleKg: 130.0, idealMinKg: 2.0, idealMaxKg: 45.0 },
  Gato: { minPossibleKg: 0.25, maxPossibleKg: 20.0, idealMinKg: 3.5, idealMaxKg: 6.0 },
  Conejo: { minPossibleKg: 0.15, maxPossibleKg: 14.0, idealMinKg: 1.2, idealMaxKg: 5.0 },
  Hurón: { minPossibleKg: 0.2, maxPossibleKg: 3.8, idealMinKg: 0.7, idealMaxKg: 2.2 },
  Ave: { minPossibleKg: 0.008, maxPossibleKg: 3.0, idealMinKg: 0.02, idealMaxKg: 0.8 },
  "Cobayo / Hámster": { minPossibleKg: 0.012, maxPossibleKg: 2.2, idealMinKg: 0.03, idealMaxKg: 1.2 },
  Reptil: { minPossibleKg: 0.01, maxPossibleKg: 35.0, idealMinKg: 0.05, idealMaxKg: 6.0 },
  Caballo: { minPossibleKg: 15.0, maxPossibleKg: 1350.0, idealMinKg: 300.0, idealMaxKg: 700.0 },
  Otro: { minPossibleKg: 0.01, maxPossibleKg: 1350.0, idealMinKg: 0.5, idealMaxKg: 50.0 },
};

export const BREED_WEIGHT_STANDARDS: Record<string, WeightRange> = {
  // --- Caninos (Perros) ---
  "Mestizo / Criollo": { minPossibleKg: 0.4, maxPossibleKg: 90.0, idealMinKg: 2.0, idealMaxKg: 50.0 },
  "Golden Retriever": { minPossibleKg: 3.5, maxPossibleKg: 65.0, idealMinKg: 25.0, idealMaxKg: 36.0 },
  "Labrador Retriever": { minPossibleKg: 3.5, maxPossibleKg: 65.0, idealMinKg: 25.0, idealMaxKg: 36.0 },
  "Pastor Alemán": { minPossibleKg: 3.5, maxPossibleKg: 60.0, idealMinKg: 28.0, idealMaxKg: 40.0 },
  "Caniche / Poodle": { minPossibleKg: 0.8, maxPossibleKg: 35.0, idealMinKg: 2.5, idealMaxKg: 25.0 },
  "Bulldog Francés": { minPossibleKg: 2.0, maxPossibleKg: 22.0, idealMinKg: 9.0, idealMaxKg: 14.0 },
  "Bulldog Inglés": { minPossibleKg: 3.0, maxPossibleKg: 38.0, idealMinKg: 18.0, idealMaxKg: 25.0 },
  "Beagle": { minPossibleKg: 2.0, maxPossibleKg: 24.0, idealMinKg: 9.0, idealMaxKg: 14.0 },
  "Boxer": { minPossibleKg: 3.0, maxPossibleKg: 50.0, idealMinKg: 25.0, idealMaxKg: 34.0 },
  "Rottweiler": { minPossibleKg: 4.0, maxPossibleKg: 75.0, idealMinKg: 38.0, idealMaxKg: 55.0 },
  "Doberman": { minPossibleKg: 3.5, maxPossibleKg: 60.0, idealMinKg: 32.0, idealMaxKg: 45.0 },
  "Yorkshire Terrier": { minPossibleKg: 0.5, maxPossibleKg: 7.0, idealMinKg: 2.0, idealMaxKg: 3.5 },
  "Schnauzer Miniatura": { minPossibleKg: 1.0, maxPossibleKg: 14.0, idealMinKg: 5.0, idealMaxKg: 8.5 },
  "Schnauzer Mediano / Gigante": { minPossibleKg: 2.5, maxPossibleKg: 60.0, idealMinKg: 14.0, idealMaxKg: 45.0 },
  "Dachshund (Salchicha)": { minPossibleKg: 1.0, maxPossibleKg: 15.0, idealMinKg: 4.0, idealMaxKg: 9.0 },
  "Border Collie": { minPossibleKg: 2.5, maxPossibleKg: 32.0, idealMinKg: 14.0, idealMaxKg: 22.0 },
  "Boyero de Berna": { minPossibleKg: 4.0, maxPossibleKg: 75.0, idealMinKg: 38.0, idealMaxKg: 55.0 },
  "Husky Siberiano": { minPossibleKg: 2.5, maxPossibleKg: 40.0, idealMinKg: 16.0, idealMaxKg: 28.0 },
  "Jack Russell Terrier": { minPossibleKg: 1.0, maxPossibleKg: 12.0, idealMinKg: 5.0, idealMaxKg: 8.0 },
  "Pomerania (Spitz)": { minPossibleKg: 0.5, maxPossibleKg: 6.0, idealMinKg: 1.8, idealMaxKg: 3.5 },
  "Dogo Argentino": { minPossibleKg: 4.0, maxPossibleKg: 65.0, idealMinKg: 40.0, idealMaxKg: 48.0 },
  "Pitbull Terrier": { minPossibleKg: 2.5, maxPossibleKg: 45.0, idealMinKg: 14.0, idealMaxKg: 30.0 },
  "Staffordshire Bull Terrier": { minPossibleKg: 2.0, maxPossibleKg: 26.0, idealMinKg: 11.0, idealMaxKg: 17.5 },
  "Shih Tzu": { minPossibleKg: 1.0, maxPossibleKg: 12.0, idealMinKg: 4.5, idealMaxKg: 8.0 },
  "Bichón Maltés": { minPossibleKg: 0.8, maxPossibleKg: 7.0, idealMinKg: 3.0, idealMaxKg: 4.5 },
  "Bichón Frisé": { minPossibleKg: 0.8, maxPossibleKg: 9.0, idealMinKg: 3.5, idealMaxKg: 6.0 },
  "Gran Danés": { minPossibleKg: 6.0, maxPossibleKg: 110.0, idealMinKg: 50.0, idealMaxKg: 85.0 },
  "San Bernardo": { minPossibleKg: 6.0, maxPossibleKg: 120.0, idealMinKg: 60.0, idealMaxKg: 95.0 },
  "Cocker Spaniel": { minPossibleKg: 2.0, maxPossibleKg: 24.0, idealMinKg: 12.0, idealMaxKg: 15.5 },
  "Chihuahua": { minPossibleKg: 0.4, maxPossibleKg: 5.5, idealMinKg: 1.5, idealMaxKg: 3.0 },
  "Pug / Carlino": { minPossibleKg: 1.2, maxPossibleKg: 14.0, idealMinKg: 6.0, idealMaxKg: 8.5 },
  "Shiba Inu": { minPossibleKg: 1.5, maxPossibleKg: 17.0, idealMinKg: 8.0, idealMaxKg: 11.0 },
  "Akita Inu": { minPossibleKg: 3.5, maxPossibleKg: 65.0, idealMinKg: 32.0, idealMaxKg: 48.0 },
  "Basset Hound": { minPossibleKg: 3.0, maxPossibleKg: 42.0, idealMinKg: 20.0, idealMaxKg: 29.0 },
  "Weimaraner": { minPossibleKg: 3.5, maxPossibleKg: 55.0, idealMinKg: 25.0, idealMaxKg: 40.0 },
  "Braco Alemán / Vizsla": { minPossibleKg: 3.0, maxPossibleKg: 45.0, idealMinKg: 22.0, idealMaxKg: 32.0 },
  "Galgo / Greyhound": { minPossibleKg: 3.5, maxPossibleKg: 50.0, idealMinKg: 27.0, idealMaxKg: 40.0 },
  "Dálmata": { minPossibleKg: 3.0, maxPossibleKg: 45.0, idealMinKg: 22.0, idealMaxKg: 32.0 },
  "Bull Terrier": { minPossibleKg: 3.0, maxPossibleKg: 45.0, idealMinKg: 22.0, idealMaxKg: 32.0 },
  "Chow Chow": { minPossibleKg: 2.5, maxPossibleKg: 45.0, idealMinKg: 20.0, idealMaxKg: 32.0 },
  "Boston Terrier": { minPossibleKg: 1.2, maxPossibleKg: 17.0, idealMinKg: 6.5, idealMaxKg: 11.5 },
  "Cane Corso": { minPossibleKg: 4.0, maxPossibleKg: 70.0, idealMinKg: 40.0, idealMaxKg: 50.0 },
  "Shar Pei": { minPossibleKg: 2.5, maxPossibleKg: 40.0, idealMinKg: 18.0, idealMaxKg: 29.0 },
  "Pastor Belga Malinois": { minPossibleKg: 3.0, maxPossibleKg: 45.0, idealMinKg: 20.0, idealMaxKg: 32.0 },
  "Pastor Australiano": { minPossibleKg: 2.5, maxPossibleKg: 42.0, idealMinKg: 18.0, idealMaxKg: 30.0 },
  "Samoyedo": { minPossibleKg: 2.5, maxPossibleKg: 42.0, idealMinKg: 20.0, idealMaxKg: 30.0 },
  "Cavalier King Charles": { minPossibleKg: 1.2, maxPossibleKg: 13.0, idealMinKg: 6.0, idealMaxKg: 8.5 },
  "Corgi Pembroke": { minPossibleKg: 1.5, maxPossibleKg: 20.0, idealMinKg: 10.0, idealMaxKg: 14.0 },
  "Basenji": { minPossibleKg: 1.5, maxPossibleKg: 17.0, idealMinKg: 9.5, idealMaxKg: 12.0 },
  "Mastín Napolitano": { minPossibleKg: 6.0, maxPossibleKg: 110.0, idealMinKg: 55.0, idealMaxKg: 75.0 },
  "Fox Terrier": { minPossibleKg: 1.2, maxPossibleKg: 14.0, idealMinKg: 7.0, idealMaxKg: 9.5 },
  "Pointer": { minPossibleKg: 3.0, maxPossibleKg: 48.0, idealMinKg: 20.0, idealMaxKg: 34.0 },
  "Setter Irlandés": { minPossibleKg: 3.0, maxPossibleKg: 45.0, idealMinKg: 24.0, idealMaxKg: 32.0 },
  "Terranova": { minPossibleKg: 6.0, maxPossibleKg: 100.0, idealMinKg: 50.0, idealMaxKg: 70.0 },
  "Alano Español": { minPossibleKg: 4.0, maxPossibleKg: 60.0, idealMinKg: 35.0, idealMaxKg: 45.0 },
  "Otra raza canina": { minPossibleKg: 0.3, maxPossibleKg: 120.0, idealMinKg: 1.5, idealMaxKg: 60.0 },

  // --- Felinos (Gatos) ---
  "Mestizo / Común Europeo": { minPossibleKg: 0.3, maxPossibleKg: 14.0, idealMinKg: 3.5, idealMaxKg: 5.5 },
  "Siamés": { minPossibleKg: 0.3, maxPossibleKg: 8.0, idealMinKg: 2.5, idealMaxKg: 4.5 },
  "Persa": { minPossibleKg: 0.4, maxPossibleKg: 10.0, idealMinKg: 3.5, idealMaxKg: 6.0 },
  "Maine Coon": { minPossibleKg: 0.6, maxPossibleKg: 18.0, idealMinKg: 5.5, idealMaxKg: 11.0 },
  "Bengalí": { minPossibleKg: 0.4, maxPossibleKg: 11.0, idealMinKg: 4.0, idealMaxKg: 7.0 },
  "Ragdoll": { minPossibleKg: 0.5, maxPossibleKg: 14.0, idealMinKg: 4.5, idealMaxKg: 9.0 },
  "British Shorthair": { minPossibleKg: 0.4, maxPossibleKg: 12.0, idealMinKg: 4.0, idealMaxKg: 8.0 },
  "Sphynx (Sin pelo)": { minPossibleKg: 0.3, maxPossibleKg: 8.0, idealMinKg: 3.0, idealMaxKg: 5.0 },
  "Bosque de Noruega": { minPossibleKg: 0.5, maxPossibleKg: 14.0, idealMinKg: 4.5, idealMaxKg: 9.0 },
  "Azul Ruso": { minPossibleKg: 0.3, maxPossibleKg: 8.5, idealMinKg: 3.0, idealMaxKg: 5.5 },
  "Angora Turco": { minPossibleKg: 0.3, maxPossibleKg: 8.0, idealMinKg: 3.0, idealMaxKg: 5.0 },
  "Abisinio": { minPossibleKg: 0.3, maxPossibleKg: 7.5, idealMinKg: 3.0, idealMaxKg: 4.5 },
  "Sagrado de Birmania": { minPossibleKg: 0.4, maxPossibleKg: 9.5, idealMinKg: 3.5, idealMaxKg: 6.0 },
  "Scottish Fold": { minPossibleKg: 0.4, maxPossibleKg: 9.0, idealMinKg: 3.0, idealMaxKg: 6.0 },
  "American Shorthair": { minPossibleKg: 0.4, maxPossibleKg: 10.0, idealMinKg: 3.5, idealMaxKg: 6.5 },
  "Bombay": { minPossibleKg: 0.3, maxPossibleKg: 8.0, idealMinKg: 3.0, idealMaxKg: 5.0 },
  "Siberiano": { minPossibleKg: 0.5, maxPossibleKg: 14.0, idealMinKg: 4.5, idealMaxKg: 9.0 },
  "Oriental de Pelo Corto": { minPossibleKg: 0.3, maxPossibleKg: 7.5, idealMinKg: 2.5, idealMaxKg: 4.5 },
  "Cornish Rex / Devon Rex": { minPossibleKg: 0.3, maxPossibleKg: 6.5, idealMinKg: 2.5, idealMaxKg: 4.5 },
  "Cartujo (Chartreux)": { minPossibleKg: 0.4, maxPossibleKg: 10.0, idealMinKg: 3.5, idealMaxKg: 6.5 },
  "Himalayo": { minPossibleKg: 0.4, maxPossibleKg: 9.5, idealMinKg: 3.5, idealMaxKg: 6.0 },
  "Balinés": { minPossibleKg: 0.3, maxPossibleKg: 7.5, idealMinKg: 2.5, idealMaxKg: 4.5 },
  "Mau Egipcio": { minPossibleKg: 0.3, maxPossibleKg: 8.0, idealMinKg: 3.0, idealMaxKg: 5.0 },
  "Somali": { minPossibleKg: 0.3, maxPossibleKg: 8.0, idealMinKg: 3.0, idealMaxKg: 5.0 },
  "Manx": { minPossibleKg: 0.4, maxPossibleKg: 9.5, idealMinKg: 3.5, idealMaxKg: 5.5 },
  "Otra raza felina": { minPossibleKg: 0.3, maxPossibleKg: 18.0, idealMinKg: 3.0, idealMaxKg: 8.0 },

  // --- Conejos ---
  "Mestizo": { minPossibleKg: 0.2, maxPossibleKg: 10.0, idealMinKg: 1.5, idealMaxKg: 4.5 },
  "Enano Holandés": { minPossibleKg: 0.15, maxPossibleKg: 2.5, idealMinKg: 0.8, idealMaxKg: 1.5 },
  "Belier / Mini Lop (Orejas caídas)": { minPossibleKg: 0.25, maxPossibleKg: 4.0, idealMinKg: 1.5, idealMaxKg: 2.5 },
  "Cabeza de León (Lionhead)": { minPossibleKg: 0.2, maxPossibleKg: 3.2, idealMinKg: 1.3, idealMaxKg: 2.0 },
  "Angora": { minPossibleKg: 0.3, maxPossibleKg: 6.0, idealMinKg: 2.5, idealMaxKg: 4.5 },
  "Mini Rex": { minPossibleKg: 0.2, maxPossibleKg: 3.0, idealMinKg: 1.4, idealMaxKg: 2.0 },
  "Neozelandés": { minPossibleKg: 0.4, maxPossibleKg: 7.5, idealMinKg: 4.0, idealMaxKg: 5.5 },
  "Californiano": { minPossibleKg: 0.4, maxPossibleKg: 7.5, idealMinKg: 3.8, idealMaxKg: 5.0 },
  "Gigante de Flandes": { minPossibleKg: 0.7, maxPossibleKg: 14.0, idealMinKg: 6.0, idealMaxKg: 10.0 },
  "Hotot": { minPossibleKg: 0.2, maxPossibleKg: 3.0, idealMinKg: 1.0, idealMaxKg: 1.8 },
  "Mariposa (Papillon)": { minPossibleKg: 0.3, maxPossibleKg: 7.0, idealMinKg: 2.5, idealMaxKg: 4.0 },
  "Chinchilla (Conejo)": { minPossibleKg: 0.3, maxPossibleKg: 6.5, idealMinKg: 2.5, idealMaxKg: 4.0 },
  "Otro conejo": { minPossibleKg: 0.15, maxPossibleKg: 14.0, idealMinKg: 1.0, idealMaxKg: 6.0 },

  // --- Hurones ---
  "Hurón Sable": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },
  "Hurón Albino": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },
  "Hurón Champagne": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },
  "Hurón Silver / Plateado": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },
  "Hurón Black Self": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },
  "Hurón Panda / Blaze": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },
  "Otro hurón": { minPossibleKg: 0.2, maxPossibleKg: 3.5, idealMinKg: 0.7, idealMaxKg: 2.2 },

  // --- Aves ---
  "Cotorra Argentina / Monje": { minPossibleKg: 0.04, maxPossibleKg: 0.22, idealMinKg: 0.09, idealMaxKg: 0.14 },
  "Canario": { minPossibleKg: 0.01, maxPossibleKg: 0.045, idealMinKg: 0.015, idealMaxKg: 0.03 },
  "Periquito Australiano": { minPossibleKg: 0.015, maxPossibleKg: 0.07, idealMinKg: 0.03, idealMaxKg: 0.045 },
  "Ninfa / Carolina": { minPossibleKg: 0.04, maxPossibleKg: 0.18, idealMinKg: 0.08, idealMaxKg: 0.125 },
  "Agapornis (Inseparable)": { minPossibleKg: 0.025, maxPossibleKg: 0.08, idealMinKg: 0.04, idealMaxKg: 0.06 },
  "Loro Hablador (Amazona)": { minPossibleKg: 0.18, maxPossibleKg: 0.8, idealMinKg: 0.35, idealMaxKg: 0.55 },
  "Cacatúa": { minPossibleKg: 0.15, maxPossibleKg: 1.3, idealMinKg: 0.3, idealMaxKg: 0.9 },
  "Guacamayo": { minPossibleKg: 0.4, maxPossibleKg: 2.5, idealMinKg: 0.9, idealMaxKg: 1.6 },
  "Diamante Mandarín": { minPossibleKg: 0.008, maxPossibleKg: 0.03, idealMinKg: 0.012, idealMaxKg: 0.022 },
  "Jilguero": { minPossibleKg: 0.008, maxPossibleKg: 0.03, idealMinKg: 0.012, idealMaxKg: 0.022 },
  "Cardo / Cardenal": { minPossibleKg: 0.02, maxPossibleKg: 0.07, idealMinKg: 0.035, idealMaxKg: 0.05 },
  "Otra especie de ave": { minPossibleKg: 0.008, maxPossibleKg: 3.0, idealMinKg: 0.02, idealMaxKg: 1.5 },

  // --- Cobayo / Hámster ---
  "Cobayo Americano (Pelo corto)": { minPossibleKg: 0.15, maxPossibleKg: 1.8, idealMinKg: 0.7, idealMaxKg: 1.3 },
  "Cobayo Abisinio": { minPossibleKg: 0.15, maxPossibleKg: 1.8, idealMinKg: 0.7, idealMaxKg: 1.3 },
  "Cobayo Peruano (Pelo largo)": { minPossibleKg: 0.15, maxPossibleKg: 1.8, idealMinKg: 0.7, idealMaxKg: 1.3 },
  "Hámster Sirio / Dorado": { minPossibleKg: 0.04, maxPossibleKg: 0.26, idealMinKg: 0.1, idealMaxKg: 0.18 },
  "Hámster Ruso": { minPossibleKg: 0.015, maxPossibleKg: 0.07, idealMinKg: 0.03, idealMaxKg: 0.05 },
  "Hámster Roborovski": { minPossibleKg: 0.012, maxPossibleKg: 0.045, idealMinKg: 0.02, idealMaxKg: 0.035 },
  "Chinchilla Doméstica": { minPossibleKg: 0.15, maxPossibleKg: 1.1, idealMinKg: 0.4, idealMaxKg: 0.8 },
  "Jerbo": { minPossibleKg: 0.025, maxPossibleKg: 0.14, idealMinKg: 0.05, idealMaxKg: 0.1 },
  "Degu": { minPossibleKg: 0.08, maxPossibleKg: 0.4, idealMinKg: 0.17, idealMaxKg: 0.3 },
  "Otro roedor": { minPossibleKg: 0.012, maxPossibleKg: 2.0, idealMinKg: 0.03, idealMaxKg: 1.0 },

  // --- Reptiles ---
  "Tortuga de Tierra": { minPossibleKg: 0.04, maxPossibleKg: 18.0, idealMinKg: 0.5, idealMaxKg: 6.0 },
  "Tortuga de Agua (Orejas rojas)": { minPossibleKg: 0.03, maxPossibleKg: 4.0, idealMinKg: 0.4, idealMaxKg: 2.5 },
  "Dragón Barbudo (Pogona)": { minPossibleKg: 0.02, maxPossibleKg: 0.85, idealMinKg: 0.3, idealMaxKg: 0.55 },
  "Gecko Leopardo": { minPossibleKg: 0.01, maxPossibleKg: 0.14, idealMinKg: 0.045, idealMaxKg: 0.09 },
  "Camaleón": { minPossibleKg: 0.02, maxPossibleKg: 0.3, idealMinKg: 0.06, idealMaxKg: 0.2 },
  "Iguana Verde": { minPossibleKg: 0.08, maxPossibleKg: 12.0, idealMinKg: 3.0, idealMaxKg: 8.0 },
  "Serpiente del Maíz": { minPossibleKg: 0.04, maxPossibleKg: 1.4, idealMinKg: 0.25, idealMaxKg: 0.9 },
  "Pitón Bola": { minPossibleKg: 0.15, maxPossibleKg: 3.8, idealMinKg: 1.2, idealMaxKg: 2.5 },
  "Otro reptil": { minPossibleKg: 0.01, maxPossibleKg: 30.0, idealMinKg: 0.05, idealMaxKg: 8.0 },

  // --- Caballos (Equinos) ---
  "Criollo Argentino": { minPossibleKg: 80.0, maxPossibleKg: 650.0, idealMinKg: 400.0, idealMaxKg: 500.0 },
  "Pura Sangre de Carrera (SPC)": { minPossibleKg: 90.0, maxPossibleKg: 700.0, idealMinKg: 450.0, idealMaxKg: 550.0 },
  "Cuarto de Milla": { minPossibleKg: 90.0, maxPossibleKg: 750.0, idealMinKg: 450.0, idealMaxKg: 550.0 },
  "Árabe": { minPossibleKg: 70.0, maxPossibleKg: 600.0, idealMinKg: 350.0, idealMaxKg: 450.0 },
  "Silla Argentino": { minPossibleKg: 90.0, maxPossibleKg: 750.0, idealMinKg: 450.0, idealMaxKg: 600.0 },
  "Polo Argentino": { minPossibleKg: 90.0, maxPossibleKg: 700.0, idealMinKg: 450.0, idealMaxKg: 550.0 },
  "Frisón": { minPossibleKg: 100.0, maxPossibleKg: 950.0, idealMinKg: 550.0, idealMaxKg: 750.0 },
  "Percherón": { minPossibleKg: 150.0, maxPossibleKg: 1300.0, idealMinKg: 800.0, idealMaxKg: 1100.0 },
  "Appaloosa": { minPossibleKg: 90.0, maxPossibleKg: 700.0, idealMinKg: 450.0, idealMaxKg: 550.0 },
  "Pony / Falabella": { minPossibleKg: 15.0, maxPossibleKg: 180.0, idealMinKg: 35.0, idealMaxKg: 120.0 },
  "Otro equino": { minPossibleKg: 15.0, maxPossibleKg: 1300.0, idealMinKg: 100.0, idealMaxKg: 700.0 },

  // --- Otros ---
  "Mestizo / Sin especificar": { minPossibleKg: 0.01, maxPossibleKg: 1300.0, idealMinKg: 0.5, idealMaxKg: 50.0 },
  "Exótico de compañía": { minPossibleKg: 0.01, maxPossibleKg: 50.0, idealMinKg: 0.1, idealMaxKg: 10.0 },
  "Otra raza o especie": { minPossibleKg: 0.01, maxPossibleKg: 1300.0, idealMinKg: 0.5, idealMaxKg: 50.0 },
};

export function getBreedsForSpecies(species: string): string[] {
  const match = Object.keys(SPECIES_CATALOG).find(
    (k) => k.toLowerCase() === species.trim().toLowerCase()
  );
  return match ? SPECIES_CATALOG[match] : SPECIES_CATALOG["Otro"];
}

export interface WeightAssessment {
  status: 'valid_ideal' | 'valid_divergent' | 'too_low' | 'too_high';
  isBlocking: boolean;
  message: string;
  minPossibleKg: number;
  maxPossibleKg: number;
  idealMinKg: number;
  idealMaxKg: number;
  breedLabel: string;
}

export function getWeightAssessment(
  species: string,
  breed: string,
  weightKg: number | string | undefined | null
): WeightAssessment | null {
  if (weightKg === undefined || weightKg === null || weightKg === "") {
    return null;
  }
  const numericWeight = typeof weightKg === "string" ? parseFloat(weightKg) : weightKg;
  if (isNaN(numericWeight)) {
    return null;
  }

  // Find species limit fallback
  const matchedSpecies = Object.keys(SPECIES_WEIGHT_LIMITS).find(
    (s) => s.toLowerCase() === (species || "").trim().toLowerCase()
  ) || "Otro";
  const speciesLimit = SPECIES_WEIGHT_LIMITS[matchedSpecies] || SPECIES_WEIGHT_LIMITS["Otro"];

  // Find exact breed limit
  const matchedBreed = Object.keys(BREED_WEIGHT_STANDARDS).find(
    (b) => b.toLowerCase() === (breed || "").trim().toLowerCase()
  );
  const range: WeightRange = matchedBreed ? BREED_WEIGHT_STANDARDS[matchedBreed] : speciesLimit;
  const label = matchedBreed || (breed && breed.trim() ? breed : matchedSpecies);

  if (numericWeight <= 0 || numericWeight < range.minPossibleKg) {
    return {
      status: "too_low",
      isBlocking: true,
      message: `El peso ingresado (${numericWeight} kg) es demasiado bajo para un ${label}. El mínimo físico posible registrado es de ${range.minPossibleKg} kg (el rango típico adulto es ${range.idealMinKg}–${range.idealMaxKg} kg). Verificá si lo ingresaste en gramos o si hubo un error.`,
      minPossibleKg: range.minPossibleKg,
      maxPossibleKg: range.maxPossibleKg,
      idealMinKg: range.idealMinKg,
      idealMaxKg: range.idealMaxKg,
      breedLabel: label,
    };
  }

  if (numericWeight > range.maxPossibleKg) {
    return {
      status: "too_high",
      isBlocking: true,
      message: `El peso ingresado (${numericWeight} kg) supera el límite físico máximo posible para un ${label} (incluso considerando obesidad severa: ${range.maxPossibleKg} kg). El rango típico adulto es de ${range.idealMinKg}–${range.idealMaxKg} kg.`,
      minPossibleKg: range.minPossibleKg,
      maxPossibleKg: range.maxPossibleKg,
      idealMinKg: range.idealMinKg,
      idealMaxKg: range.idealMaxKg,
      breedLabel: label,
    };
  }

  if (numericWeight >= range.idealMinKg && numericWeight <= range.idealMaxKg) {
    return {
      status: "valid_ideal",
      isBlocking: false,
      message: `✓ Peso dentro del promedio esperado para la raza (${range.idealMinKg}–${range.idealMaxKg} kg).`,
      minPossibleKg: range.minPossibleKg,
      maxPossibleKg: range.maxPossibleKg,
      idealMinKg: range.idealMinKg,
      idealMaxKg: range.idealMaxKg,
      breedLabel: label,
    };
  }

  return {
    status: "valid_divergent",
    isBlocking: false,
    message: `ℹ️ Peso fuera del promedio típico adulto (${range.idealMinKg}–${range.idealMaxKg} kg), pero admisible (compatible con cachorro/joven o condición clínica especial).`,
    minPossibleKg: range.minPossibleKg,
    maxPossibleKg: range.maxPossibleKg,
    idealMinKg: range.idealMinKg,
    idealMaxKg: range.idealMaxKg,
    breedLabel: label,
  };
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
