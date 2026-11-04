
const API_URL = "http://localhost:3000/api/products";

const products = [
  // Procesadores
  { id: 3, name: "AMD Ryzen 5 5600", price: 129, category: "CPU", stock: 12 },
  { id: 4, name: "AMD Ryzen 7 7800X3D", price: 399, category: "CPU", stock: 6 },
  { id: 5, name: "AMD Ryzen 9 9950X", price: 599, category: "CPU", stock: 4 },
  { id: 6, name: "Intel Core i5-14600K", price: 289, category: "CPU", stock: 8 },
  { id: 7, name: "Intel Core i7-14700K", price: 369, category: "CPU", stock: 5 },

  // Placas de video
  { id: 8, name: "NVIDIA RTX 4060", price: 299, category: "GPU", stock: 10 },
  { id: 9, name: "NVIDIA RTX 4070 SUPER", price: 599, category: "GPU", stock: 5 },
  { id: 10, name: "NVIDIA RTX 5080", price: 999, category: "GPU", stock: 3 },

  // Memorias RAM
  { id: 11, name: "Corsair Vengeance 16GB DDR4", price: 45, category: "RAM", stock: 20 },
  { id: 12, name: "Corsair Vengeance 32GB DDR5", price: 95, category: "RAM", stock: 15 },
  { id: 13, name: "Kingston Fury Beast 32GB DDR5", price: 89, category: "RAM", stock: 12 },

  // Motherboards
  { id: 14, name: "MSI B550 Tomahawk", price: 159, category: "Motherboard", stock: 7 },
  { id: 15, name: "MSI B650 Gaming Plus WiFi", price: 189, category: "Motherboard", stock: 6 },
  { id: 16, name: "ASUS TUF Gaming Z790-Plus WiFi", price: 249, category: "Motherboard", stock: 4 },

  // Almacenamiento
  { id: 17, name: "Samsung 990 EVO 1TB NVMe", price: 89, category: "Storage", stock: 14 },
  { id: 18, name: "Kingston NV2 1TB NVMe", price: 59, category: "Storage", stock: 18 },

  // Fuentes
  { id: 19, name: "Corsair RM750e 750W", price: 99, category: "PSU", stock: 8 },

  // Refrigeración
  { id: 20, name: "DeepCool AK400", price: 35, category: "Cooling", stock: 10 }
];

async function seedProducts() {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });

      const result = await response.json();

      if (response.status === 201) {
        created++;
        console.log(`CREADO: ${product.name}`);
      } else if (response.status === 409) {
        skipped++;
        console.log(`YA EXISTE: ${product.name}`);
      } else {
        failed++;
        console.error(
          `ERROR ${response.status}: ${product.name}`,
          result
        );
      }
    } catch (error) {
      failed++;
      console.error(`No se pudo cargar ${product.name}:`, error);
    }
  }

  console.log("\n--- RESUMEN DE CARGA ---");
  console.log(`Creados: ${created}`);
  console.log(`Ya existentes: ${skipped}`);
  console.log(`Errores: ${failed}`);
}

seedProducts();
