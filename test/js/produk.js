// ===== KONFIGURASI =====
const WA_NUMBER = "6281234567890"; // GANTI dengan nomor WA toko (format 62xxx)

// ===== UTIL =====
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

async function ambilProduk() {
  const res = await fetch("data/produk.json");
  const data = await res.json();
  return data.produk;
}

function linkWA(namaProduk) {
  const pesan = encodeURIComponent(
    `Halo, saya tertarik dengan produk *${namaProduk}*. Apakah masih tersedia?`
  );
  return `https://wa.me/${WA_NUMBER}?text=${pesan}`;
}

// ===== RENDER KARTU =====
function buatKartu(p) {
  const badge = p.stok
    ? '<span class="badge-stok">Tersedia</span>'
    : '<span class="badge-habis">Habis</span>';

  const spek = p.kategori === "velg"
    ? `Ring ${p.ukuran} • PCD ${p.pcd} • ET ${p.offset}`
    : `Ukuran ${p.ukuran} • ${p.merek}`;

  return `
    <a href="produk.html?id=${p.id}" class="kartu">
      <div class="kartu-img" style="background-image:url('${p.gambar}')">
        ${badge}
      </div>
      <div class="kartu-body">
        <span class="kategori">${p.kategori}</span>
        <h3>${p.nama}</h3>
        <div class="spek">${spek}</div>
        <div class="harga">${formatRupiah(p.harga)}</div>
      </div>
    </a>
  `;
}

// ===== HALAMAN DETAIL =====
async function renderDetail() {
  const el = document.getElementById("detail");
  if (!el) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) { el.innerHTML = "<p>Produk tidak ditemukan.</p>"; return; }

  const semua = await ambilProduk();
  const p = semua.find((x) => x.id === id);
  if (!p) { el.innerHTML = "<p>Produk tidak ditemukan.</p>"; return; }

  const spek = p.kategori === "velg"
    ? `<tr><td>Ring</td><td>${p.ukuran}</td></tr>
       <tr><td>PCD</td><td>${p.pcd}</td></tr>
       <tr><td>Offset</td><td>${p.offset}</td></tr>`
    : `<tr><td>Ukuran</td><td>${p.ukuran}</td></tr>`;

  el.innerHTML = `
    <div class="detail-produk">
      <img src="${p.gambar}" alt="${p.nama}">
      <div>
        <span class="kategori" style="color:#f59e0b;font-weight:600;text-transform:uppercase;font-size:.8rem">${p.kategori}</span>
        <h1>${p.nama}</h1>
        <div class="harga-detail">${formatRupiah(p.harga)}</div>
        <p style="color:${p.stok ? '#10b981' : '#ef4444'};font-weight:600;margin-bottom:16px">
          ${p.stok ? "✔ Stok tersedia" : "✘ Stok habis"}
        </p>
        <table class="spek-table">
          <tr><td>Merek</td><td>${p.merek}</td></tr>
          ${spek}
        </table>
        <p style="margin:16px 0;color:#555">${p.deskripsi}</p>
        <a href="${linkWA(p.nama)}" target="_blank" class="btn" style="display:block;text-align:center;margin-top:20px">
          💬 Order via WhatsApp
        </a>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderDetail);

