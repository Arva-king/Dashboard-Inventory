/**
 * MAIN JAVASCRIPT FILE - TokoMajoo
 * Mengatur logika untuk Dashboard, Tabel, Form, dan Profil.
 */

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Cek jika kita berada di halaman Dashboard (index.html)
    // Fitur: Chart.js
    const chartCanvas = document.getElementById('salesChart');
    if (chartCanvas) {
        initDashboardChart(chartCanvas);
    }

    // 2. Cek jika kita berada di halaman Data Produk (products.html)
    // Fitur: DataTables & SweetAlert Delete
    const tableElement = document.getElementById('productTable');
    if (tableElement) {
        // Inisialisasi DataTables (jQuery required)
        $(tableElement).DataTable({
            language: {
                url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/id.json" // Bahasa Indonesia
            }
        });

        // Event Listener untuk tombol hapus (Delegation)
        tableElement.addEventListener('click', function(e) {
            if(e.target.classList.contains('btn-delete')) {
                handleDelete(e.target);
            }
        });
    }

    // 3. Cek jika kita berada di halaman Tambah Barang (add-item.html)
    // Fitur: Form Validation & SweetAlert Success
    const addForm = document.getElementById('addItemForm');
    if (addForm) {
        addForm.addEventListener('submit', handleFormSubmit);
    }

});

/* --- FUNCTION DEFINITIONS --- */

/**
 * Fungsi 1: Menggambar Grafik dengan Chart.js
 */
function initDashboardChart(canvas) {
    new Chart(canvas, {
        type: 'bar', // Tipe grafik
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            datasets: [{
                label: 'Penjualan (Juta Rp)',
                data: [12, 19, 8, 15, 22, 18],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/**
 * Fungsi 2: Handle Submit Form dengan Validasi
 */
function handleFormSubmit(event) {
    event.preventDefault(); // Mencegah reload halaman

    // Ambil nilai input
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const stock = document.getElementById('itemStock').value;
    const price = document.getElementById('itemPrice').value;

    // Validasi Sederhana
    if (!name || !category || !stock || !price) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Semua kolom wajib diisi!',
        });
        return;
    }

    // Jika sukses
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Produk "${name}" berhasil ditambahkan ke database.`,
        showConfirmButton: false,
        timer: 2000
    }).then(() => {
        // Reset form setelah sukses
        document.getElementById('addItemForm').reset();
    });
}

/**
 * Fungsi 3: Konfirmasi Hapus dengan SweetAlert
 */
function handleDelete(buttonElement) {
    Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Hapus baris tabel (Visual saja untuk demo)
            const row = buttonElement.closest('tr');
            row.remove();
            
            Swal.fire(
                'Terhapus!',
                'Data produk telah dihapus.',
                'success'
            );
        }
    });
}

/**
 * Fungsi 4: Toggle Edit Profil (Manipulasi DOM)
 * Digunakan di profile.html
 */
function toggleEditProfile() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    // Toggle class d-none (display: none di Bootstrap)
    if (viewMode.classList.contains('d-none')) {
        viewMode.classList.remove('d-none');
        editMode.classList.add('d-none');
    } else {
        viewMode.classList.add('d-none');
        editMode.classList.remove('d-none');
    }
}

function saveProfile() {
    const newName = document.getElementById('editNameInput').value;
    document.getElementById('displayName').innerText = newName;
    toggleEditProfile(); // Kembali ke mode view
    
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Profil diperbarui',
        showConfirmButton: false,
        timer: 1500
    });
}