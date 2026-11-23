let semuaProduk = [];

async function initKatalog() {
  const grid = document.getElementById("grid-produk");
  if (!grid) return;

  semuaProduk = await ambilProduk();
  renderGrid(semuaProduk);
  isiFilterMerek();
}

function renderGrid(list) {
  const grid = document.getElementById("grid-produk");
  if (list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#888;padding:40px">Tidak ada produk yang cocok.</p>`;
    return;
  }
  grid.innerHTML = list.map(buatKartu).join("");
}

function isiFilterMerek() {
  const sel = document.getElementById("filter-merek");
  if (!sel) return;
  const merek = [...new Set(semuaProduk.map((p) => p.merek))].sort();
  sel.innerHTML = `<option value="">Semua Merek</option>` +
    merek.map((m) => `<option value="${m}">${m}</option>`).join("");
}

function terapkanFilter() {
  const kategori = document.getElementById("filter-kategori")?.value || "";
  const merek = document.getElementById("filter-merek")?.value || "";
  const ukuran = document.getElementById("filter-ukuran")?.value || "";
  const cari = document.getElementById("filter-cari")?.value.toLowerCase() || "";

  const hasil = semuaProduk.filter((p) => {
    if (kategori && p.kategori !== kategori) return false;
    if (merek && p.merek !== merek) return false;
    if (ukuran && p.ukuran !== ukuran) return false;
    if (cari && !p.nama.toLowerCase().includes(cari)) return false;
    return true;
  });

  renderGrid(hasil);
}

document.addEventListener("DOMContentLoaded", () => {
  initKatalog();
  ["filter-kategori", "filter-merek", "filter-ukuran", "filter-cari"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", terapkanFilter);
  });
});

