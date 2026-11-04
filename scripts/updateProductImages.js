
const API_URL = "http://localhost:3000/api/products";

const images = [
  { id: 3, name: "AMD Ryzen 5 5600", image: "https://statics.qloud.com.ar/pc-store-computacion-11-2023/309_19-01-2024-05-01-47-amd-ryzen-5-5600x.jpg" },
  { id: 4, name: "AMD Ryzen 7 7800X3D", image: "https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2505503-ryzen-7-7800x3d-front.jpg" },
  { id: 5, name: "AMD Ryzen 9 9950X", image: "https://geekawhat.com/wp-content/uploads/2025/03/FI_AMD-Ryzen-9-9950X3D.jpg" },
  { id: 6, name: "Intel Core i5-14600K", image: "https://www.venex.com.ar/products_images/1708018271_i5.png" },
  { id: 7, name: "Intel Core i7-14700K", image: "https://cdn.visaovip.com/img/prod/procesador-intel-core-i7-14700k-socket-lga-1700-56ghz-33mb/41981/598581.jpg" },
  { id: 8, name: "NVIDIA RTX 4060", image: "https://compucordoba.com.ar/img/Public/1078/40508-producto-rtx-4060-msi-white.JPG" },
  { id: 9, name: "NVIDIA RTX 4070 SUPER", image: "https://static.nb.com.ar/i/nb_PLACA-DE-VIDEO-GIGABYTE-RTX-4070-SUPER-WF3-OC-12GB_ver_a792b52b27a3c10901db9a82d47bc4a0.jpg" },
  { id: 10, name: "NVIDIA RTX 5080", image: "https://katech.com.ar/wp-content/uploads/2025/12/X1-24.jpg" },
  { id: 11, name: "Corsair Vengeance 16GB DDR4", image: "https://spacegamer.com.ar/img/Public/1058-producto-1-7384.jpg" },
  { id: 12, name: "Corsair Vengeance 32GB DDR5", image: "https://dinobyte.ar/wp-content/uploads/Memoria-Corsair-Vengeance-Ddr5-X2.jpg" },
  { id: 13, name: "Kingston Fury Beast 32GB DDR5", image: "https://www.venex.com.ar/products_images/1755004903_3.jpg" },
  { id: 14, name: "MSI B550 Tomahawk", image: "https://i.ebayimg.com/images/g/6tMAAeSwb1Zp08P3/s-l1200.jpg" },
  { id: 15, name: "MSI B650 Gaming Plus WiFi", image: "https://gorilagames.com/img/Public/1019/41579-producto-motherboard-gigabyte-b650m-gaming-wifi-amd-am5-ddr5-gorila-games-1.jpg" },
  { id: 16, name: "ASUS TUF Gaming Z790-Plus WiFi", image: "https://www.newtree.com.ar/Temp/App_WebSite/App_PictureFiles/Items/4711081941088_800.jpg" },
  { id: 17, name: "Samsung 990 EVO 1TB NVMe", image: "https://www.storagereview.com/wp-content/uploads/2024/10/StorageReview-Samsung-990-Evo-Plus-2-1024x707.jpg" },
  { id: 18, name: "Kingston NV2 1TB NVMe", image: "https://fullh4rd.com.ar/img/productos/12/hd-ssd-1tb-kingston-snvs-nv2-m2-nvme-gen4-3500mbs-2280-0.jpg" },
  { id: 19, name: "Corsair RM750e 750W", image: "https://fullh4rd.com.ar/img/productos/26/fuente-750w-corsair-rm750e-80-plus-gold-bajo-ruido-fully-modular-0.jpg" },
  { id: 20, name: "DeepCool AK400", image: "https://mla-s1-p.mlstatic.com/611530-MLA96711673919_102025-F.jpg" }
];

async function updateProductImages() {
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of images) {
    if (!product.image.trim()) {
      skipped++;
      console.log(`SIN URL: ${product.name}`);
      continue;
    }

    try {
      const response = await fetch(
        `${API_URL}/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            image: product.image.trim()
          })
        }
      );

      const result = await response.json();

      if (response.ok) {
        updated++;
        console.log(`ACTUALIZADA: ${product.name}`);
      } else {
        failed++;
        console.error(
          `ERROR ${response.status}: ${product.name}`,
          result
        );
      }
    } catch (error) {
      failed++;
      console.error(`Error de conexión: ${product.name}`, error);
    }
  }

  console.log("\n--- RESUMEN DE IMÁGENES ---");
  console.log(`Actualizadas: ${updated}`);
  console.log(`Sin URL: ${skipped}`);
  console.log(`Errores: ${failed}`);
}

updateProductImages();
