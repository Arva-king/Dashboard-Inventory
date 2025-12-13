/**
 * MAIN JAVASCRIPT - TokoMajoo Ultimate
 * Fitur: CRUD, POS, Map, Scanner, Voice, Backup, Print, Auth
 */

const STORAGE_KEY = 'TOKO_MAJOO_DATA';
const CATEGORY_KEY = 'TOKO_MAJOO_CATEGORIES';
const HISTORY_KEY = 'TOKO_MAJOO_HISTORY';
const PROFILE_KEY = 'TOKO_MAJOO_PROFILE';
const TARGET_SALES = 1000000;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Cek Login
    if (!sessionStorage.getItem('CURRENT_USER_ROLE')) {
        const loginModalEl = document.getElementById('loginModal');
        if(loginModalEl) {
            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
        }
    } else {
        applyRolePermissions();
    }

    // 2. Init Fitur Umum
    initDarkMode();
    loadProfileName();
    injectVoiceButton();
    
    // 3. Routing Logic per Halaman
    if (document.getElementById('salesChart')) {
        initDashboardChart(document.getElementById('salesChart'));
        updateDashboardStats();
        renderSmartRestock();
        checkSalesTarget();
    }

    if (document.getElementById('productTable')) {
        renderTable();
        document.getElementById('productTable').addEventListener('click', function(e) {
            if(e.target.classList.contains('btn-edit')) openEditModal(e.target.dataset.id);
        });
    }

    if (document.getElementById('addItemForm')) {
        document.getElementById('addItemForm').addEventListener('submit', handleFormSubmit);
        loadCategoriesToSelect();
        setupRupiahInput(document.getElementById('itemPrice'));
        setupImagePreview(document.getElementById('itemImage'));
        checkEditMode();
    }

    if (document.getElementById('posArea')) {
        initPOS(); // POS dengan Search
        const scanModal = document.getElementById('scanModal');
        if(scanModal) {
            scanModal.addEventListener('shown.bs.modal', startScanner);
            scanModal.addEventListener('hidden.bs.modal', stopScanner);
        }
    }

    if (document.getElementById('historyTable')) renderHistory();
    if (document.getElementById('displayName')) loadProfilePage();
});

/* --- AUTH SYSTEM --- */
window.performLogin = function() {
    const role = document.getElementById('userRole').value;
    const pin = document.getElementById('userPin').value;

    if ((role === 'admin' && pin === '1234') || (role === 'cashier' && pin === '0000')) {
        sessionStorage.setItem('CURRENT_USER_ROLE', role);
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        applyRolePermissions();
        Swal.fire({ icon: 'success', title: `Login: ${role.toUpperCase()}`, timer: 1000, showConfirmButton: false });
    } else {
        Swal.fire('Gagal', 'PIN Salah! (Admin: 1234, Kasir: 0000)', 'error');
    }
};

function applyRolePermissions() {
    const role = sessionStorage.getItem('CURRENT_USER_ROLE');
    const brand = document.querySelector('.navbar-brand');
    if(brand) brand.innerHTML += ` <small style="font-size:12px; opacity:0.7">(${role})</small>`;

    if (role === 'cashier') {
        const style = document.createElement('style');
        style.innerHTML = `
            .btn-danger, .btn-edit, .btn-warning, 
            a[href="add-item.html"], a[href="history.html"], a[href="profile.html"],
            button[onclick="clearAllHistory()"]
            { display: none !important; }
        `;
        document.head.appendChild(style);
    }
}

/* --- POS SYSTEM WITH SEARCH --- */
function initPOS() {
    const grid = document.getElementById('posProductGrid');
    const searchInput = document.getElementById('searchPos');
    const products = getProducts();

    function renderGrid(items) {
        grid.innerHTML = '';
        if (items.length === 0) {
            grid.innerHTML = `<div class="col-12 text-center mt-5 text-muted">Barang tidak ditemukan 😕</div>`;
            return;
        }
        items.forEach(p => {
            if(p.stock > 0) {
                grid.innerHTML += `
                <div class="col-6 col-md-4 mb-3">
                    <div class="card h-100 cursor-pointer" onclick="addToCart(${p.id})">
                        <img src="${p.image || 'https://via.placeholder.com/150'}" class="card-img-top" style="height:100px; object-fit:cover;">
                        <div class="card-body p-2 text-center">
                            <small class="fw-bold d-block text-truncate" title="${p.name}">${p.name}</small>
                            <span class="text-primary small">Rp ${parseInt(p.price).toLocaleString('id-ID')}</span>
                            <br><span class="badge bg-secondary" style="font-size:0.7rem">Stok: ${p.stock}</span>
                        </div>
                    </div>
                </div>`;
            }
        });
    }

    renderGrid(products);

    if (searchInput) {
        const newSearch = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearch, searchInput);
        newSearch.addEventListener('keyup', function(e) {
            const keyword = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(keyword) || p.id.toString().includes(keyword));
            renderGrid(filtered);
        });
    }
}

window.addToCart = function(id) {
    if(!window.currentCart) window.currentCart = [];
    const p = getProducts().find(i => i.id == id);
    const exist = window.currentCart.find(c => c.id == id);
    if(exist) {
        if(exist.qty < p.stock) exist.qty++; else return Swal.fire('Stok Habis','','error');
    } else window.currentCart.push({...p, qty: 1});
    updateCartUI();
};

window.removeFromCart = function(i) { window.currentCart.splice(i, 1); updateCartUI(); };

window.updateCartUI = function() {
    const tbody = document.getElementById('cartTableBody');
    const totalEl = document.getElementById('cartTotal');
    const subtotalEl = document.getElementById('cartSubtotal');
    
    tbody.innerHTML = ''; let subtotal = 0;
    (window.currentCart||[]).forEach((item, i) => {
        let t = item.price * item.qty; subtotal += t;
        tbody.innerHTML += `<tr><td><small>${item.name}</small></td><td>${item.qty}</td><td>${t.toLocaleString('id-ID')}</td><td><button class="btn btn-sm btn-danger py-0" onclick="removeFromCart(${i})">&times;</button></td></tr>`;
    });
    
    if(subtotalEl) subtotalEl.innerText = 'Rp ' + subtotal.toLocaleString('id-ID');
    if(totalEl) totalEl.innerText = 'Rp ' + (subtotal + (shippingCost||0)).toLocaleString('id-ID');
};

window.processCheckout = function() {
    if(!window.currentCart || window.currentCart.length === 0) return Swal.fire('Keranjang Kosong', '', 'warning');
    const totalText = document.getElementById('cartTotal').innerText;
    
    Swal.fire({
        title: 'Konfirmasi Bayar',
        text: `Total: ${totalText}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Bayar & Print',
        showDenyButton: true,
        denyButtonText: 'Bayar & WA',
        denyButtonColor: '#25D366'
    }).then((result) => {
        if (result.isConfirmed || result.isDenied) handleTransactionSuccess(totalText, result.isDenied);
    });
};

function handleTransactionSuccess(totalText, sendWA) {
    let products = getProducts();
    window.currentCart.forEach(cItem => {
        let pIndex = products.findIndex(p => p.id === cItem.id);
        if(pIndex !== -1) products[pIndex].stock -= cItem.qty;
    });

    saveProducts(products);
    logHistory('Penjualan', `Transaksi POS senilai ${totalText}`);
    
    printThermalReceipt(totalText); // Print Struk

    if(sendWA) {
        let msg = `*Struk TokoMajoo*\n\n`;
        window.currentCart.forEach(i => msg += `${i.name} x${i.qty} = ${parseInt(i.price*i.qty).toLocaleString('id-ID')}\n`);
        if(shippingCost > 0) msg += `Ongkir: ${shippingCost.toLocaleString('id-ID')}\n`;
        msg += `\n*TOTAL: ${totalText}*`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }

    window.currentCart = []; shippingCost = 0;
    if(document.getElementById('shippingCost')) document.getElementById('shippingCost').innerText = 'Rp 0';
    updateCartUI(); initPOS(); checkSalesTarget();
}

function printThermalReceipt(totalText) {
    let printDiv = document.createElement('div');
    printDiv.id = 'printArea';
    let itemsHtml = '';
    window.currentCart.forEach(item => {
        itemsHtml += `<div style="display:flex; justify-content:space-between;"><span>${item.name.substring(0,15)} x${item.qty}</span><span>${(item.price*item.qty).toLocaleString('id-ID')}</span></div>`;
    });
    printDiv.innerHTML = `<div style="text-align:center;border-bottom:1px dashed #000;margin-bottom:5px;"><h3>TOKOMAJOO</h3><small>${new Date().toLocaleString()}</small></div><div>${itemsHtml}</div><div style="border-top:1px dashed #000;margin-top:5px;display:flex;justify-content:space-between;font-weight:bold;"><span>TOTAL</span><span>${totalText}</span></div><div style="text-align:center;margin-top:10px;"><small>* Terima Kasih *</small></div>`;
    document.body.appendChild(printDiv);
    window.print();
    document.body.removeChild(printDiv);
}

/* --- BACKUP & RESTORE --- */
window.downloadBackup = function() {
    const data = {
        products: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
        history: JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"),
        categories: JSON.parse(localStorage.getItem(CATEGORY_KEY) || "[]"),
        profile: localStorage.getItem(PROFILE_KEY) || "Admin",
        timestamp: new Date().toLocaleString()
    };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Backup_TokoMajoo_${Date.now()}.json`;
    a.click();
};

window.restoreBackup = function(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(!data.products) throw new Error();
            Swal.fire({title:'Restore?', text:'Data lama akan tertimpa!', icon:'warning', showCancelButton:true}).then(r => {
                if(r.isConfirmed) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products));
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
                    localStorage.setItem(CATEGORY_KEY, JSON.stringify(data.categories));
                    localStorage.setItem(PROFILE_KEY, data.profile);
                    location.reload();
                }
            });
        } catch(err) { Swal.fire('Error', 'File rusak', 'error'); }
    };
    reader.readAsText(file);
};

/* --- MAP & ONGKIR --- */
let map, marker, shippingCost = 0;
const STORE_LAT = -6.2088, STORE_LNG = 106.8456, PRICE_PER_KM = 5000;

window.openMapModal = function() {
    const mapModal = new bootstrap.Modal(document.getElementById('mapModal'));
    mapModal.show();
    setTimeout(() => {
        if(!map) {
            map = L.map('map').setView([STORE_LAT, STORE_LNG], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker([STORE_LAT, STORE_LNG]).addTo(map).bindPopup("Toko").openPopup();
            map.on('click', function(e) {
                if(marker) map.removeLayer(marker);
                marker = L.marker(e.latlng).addTo(map);
                calculateDistance(e.latlng.lat, e.latlng.lng);
            });
        }
        map.invalidateSize();
    }, 500);
};

function calculateDistance(lat, lng) {
    const R = 6371; 
    const dLat = (lat - STORE_LAT) * Math.PI/180;
    const dLon = (lng - STORE_LNG) * Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(STORE_LAT*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    shippingCost = Math.ceil(dist * PRICE_PER_KM);
    document.getElementById('distanceValue').innerText = dist.toFixed(1);
    document.getElementById('shippingCost').innerText = 'Rp ' + shippingCost.toLocaleString('id-ID');
    updateCartUI();
}

/* --- SCANNER --- */
let html5QrcodeScanner;
function startScanner() {
    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            stopScanner();
            document.querySelector('#scanModal .btn-close').click();
            const p = getProducts().find(x => x.id == decodedText || x.name.toLowerCase() === decodedText.toLowerCase());
            if(p) { addToCart(p.id); Swal.fire({icon:'success', title:'Ditemukan', timer:1000, showConfirmButton:false}); }
            else Swal.fire('Gagal', 'Tidak ditemukan', 'error');
        }
    ).catch(console.log);
}
function stopScanner() { if(html5QrcodeScanner) html5QrcodeScanner.stop().then(()=>html5QrcodeScanner.clear()); }

/* --- CORE FUNCTIONS (Helper) --- */
function initDarkMode() { if (localStorage.getItem('DARK_MODE') === 'true') document.body.classList.add('dark-mode'); }
window.toggleDarkMode = function() { document.body.classList.toggle('dark-mode'); localStorage.setItem('DARK_MODE', document.body.classList.contains('dark-mode')); };
function getProducts() { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
function saveProducts(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function logHistory(action, detail) {
    const logs = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    logs.unshift({ date: new Date().toLocaleString('id-ID'), action, detail });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(logs));
}

// Lock Screen Timer
let idleTime = 0;
document.onmousemove = () => idleTime = 0;
document.onkeypress = () => idleTime = 0;
setInterval(() => {
    idleTime++;
    if(idleTime >= 60) {
        const lock = document.getElementById('lockScreen');
        if(lock && lock.classList.contains('hidden')) lock.classList.remove('hidden');
    }
}, 1000);
window.unlockSystem = function() {
    if(document.getElementById('unlockPin').value === "1234") {
        document.getElementById('lockScreen').classList.add('hidden');
        document.getElementById('unlockPin').value = "";
        idleTime = 0;
    } else Swal.fire('PIN Salah', 'Default: 1234', 'error');
};

// Voice Button Injection
function injectVoiceButton() {
    const btn = document.createElement('button');
    btn.className = 'voice-btn'; btn.innerHTML = '🎤'; btn.onclick = toggleVoiceCommand;
    document.body.appendChild(btn);
}
function toggleVoiceCommand() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return Swal.fire('Error','Browser tidak support','error');
    const rec = new SR(); rec.lang = 'id-ID';
    rec.onstart = () => document.querySelector('.voice-btn').classList.add('listening');
    rec.onend = () => document.querySelector('.voice-btn').classList.remove('listening');
    rec.onresult = (e) => {
        const cmd = e.results[0][0].transcript.toLowerCase();
        if(cmd.includes('kasir')) location.href='pos.html';
        else if(cmd.includes('produk')) location.href='products.html';
        else if(cmd.includes('dashboard')) location.href='index.html';
        else if(cmd.includes('gelap')) { if(!document.body.classList.contains('dark-mode')) toggleDarkMode(); }
        else if(cmd.includes('terang')) { if(document.body.classList.contains('dark-mode')) toggleDarkMode(); }
    };
    rec.start();
}

// Chart & Gamification
function checkSalesTarget() {
    const logs = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const today = new Date().toLocaleDateString('id-ID');
    let total = 0;
    logs.forEach(l => { if(l.action==='Penjualan' && l.date.includes(today)) total += parseInt(l.detail.replace(/[^0-9]/g,'')||0); });
    const bar = document.getElementById('salesProgressBar');
    if(bar) {
        const pct = Math.min((total/TARGET_SALES)*100, 100);
        bar.style.width = pct+'%';
        document.getElementById('salesProgressText').innerText = `Rp ${total.toLocaleString()} / Rp ${TARGET_SALES.toLocaleString()}`;
        if(pct >= 100 && !sessionStorage.getItem('CONFETTI')) {
            confetti({particleCount:150, spread:70, origin:{y:0.6}});
            Swal.fire('Target Tercapai!','','success');
            sessionStorage.setItem('CONFETTI','true');
        }
    }
}
function initDashboardChart(ctx) {
    const p = getProducts(); const c = {}; p.forEach(i => c[i.category] = (c[i.category]||0)+1);
    new Chart(ctx, {type:'bar', data:{labels:Object.keys(c), datasets:[{label:'Stok', data:Object.values(c), backgroundColor:'#0d6efd'}]}});
}
function updateDashboardStats() {
    const p = getProducts();
    const total = p.reduce((a,b)=>a+(b.price*b.stock),0);
    const cards = document.querySelectorAll('.card-text.fs-4');
    if(cards.length>0) {
        cards[0].innerText = 'Rp ' + total.toLocaleString();
        cards[1].innerText = p.length + ' Item';
        cards[2].innerText = (JSON.parse(localStorage.getItem(HISTORY_KEY))||[]).length + ' Log';
    }
}
function renderSmartRestock() {
    const list = document.getElementById('smartRestockList');
    if(list) {
        list.innerHTML = '';
        const low = getProducts().filter(x=>x.stock<5);
        if(low.length===0) list.innerHTML = '<li class="list-group-item text-center text-muted">Aman 👍</li>';
        low.forEach(i => list.innerHTML += `<li class="list-group-item d-flex justify-content-between"><div><b>${i.name}</b><br><small class="text-danger">Sisa: ${i.stock}</small></div><button class="btn btn-sm btn-outline-primary" onclick="quickRestock(${i.id})">+</button></li>`);
    }
}
window.quickRestock = function(id) {
    Swal.fire({title:'Tambah Stok', input:'number', inputValue:10, showCancelButton:true}).then(r=>{
        if(r.isConfirmed){ let p=getProducts(); let idx=p.findIndex(x=>x.id==id); if(idx!=-1){ p[idx].stock+=parseInt(r.value); saveProducts(p); renderSmartRestock(); updateDashboardStats(); Swal.fire('Sukses','','success'); } }
    });
};

// CRUD
function renderTable() {
    const p = getProducts(); const b = document.getElementById('productTableBody'); b.innerHTML='';
    p.forEach(x => b.innerHTML += `<tr class="${x.stock<5?'low-stock':''}"><td>${x.id}</td><td><img src="${x.image||''}" class="img-preview-table"></td><td>${x.name}</td><td>${x.category}</td><td>${x.stock}</td><td>${parseInt(x.price).toLocaleString()}</td><td><button class="btn btn-sm btn-warning btn-edit" data-id="${x.id}">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteProduct(${x.id})">Hapus</button></td></tr>`);
    if($.fn.DataTable.isDataTable('#productTable')) $('#productTable').DataTable().destroy();
    $('#productTable').DataTable({dom:'Bfrtip', buttons:['excel','print']});
}
window.deleteProduct = function(id) { Swal.fire({title:'Hapus?', icon:'warning', showCancelButton:true}).then(r=>{if(r.isConfirmed){ let p=getProducts().filter(x=>x.id!=id); saveProducts(p); renderTable(); Swal.fire('Terhapus','','success'); logHistory('Hapus', `ID ${id}`); }}); };
function handleFormSubmit(e) {
    e.preventDefault();
    const id=document.getElementById('editId').value;
    const name=document.getElementById('itemName').value;
    const price=parseInt(document.getElementById('itemPrice').value.replace(/\./g,''));
    const stock=parseInt(document.getElementById('itemStock').value);
    const cat=document.getElementById('itemCategory').value;
    const img=document.getElementById('previewImg').src;
    let p=getProducts();
    if(id) { const i=p.findIndex(x=>x.id==id); if(i!=-1) p[i]={...p[i], name, price, stock, category:cat, image:img.includes('data:')?img:p[i].image}; }
    else p.push({id:Date.now(), name, price, stock, category:cat, image:img});
    saveProducts(p); Swal.fire('Tersimpan','','success').then(()=>location.href='products.html');
}
function loadCategoriesToSelect() {
    const sel=document.querySelectorAll('.category-select'); const c=JSON.parse(localStorage.getItem(CATEGORY_KEY))||["Umum"];
    sel.forEach(s => { s.innerHTML='<option value="">Pilih...</option>'; c.forEach(x=>s.innerHTML+=`<option value="${x}">${x}</option>`); });
}
window.addCategory = function() { Swal.fire({input:'text', title:'Kategori Baru', showCancelButton:true}).then(r=>{ if(r.value){ let c=JSON.parse(localStorage.getItem(CATEGORY_KEY))||["Umum"]; c.push(r.value); localStorage.setItem(CATEGORY_KEY, JSON.stringify(c)); loadCategoriesToSelect(); } }); };
function setupRupiahInput(el) { if(el) el.addEventListener('keyup', function(e){ this.value = this.value.replace(/[^,\d]/g,'').toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }); }
function setupImagePreview(el) { if(el) el.addEventListener('change', function(){ if(this.files[0]){ const r=new FileReader(); r.onload=e=>{ document.getElementById('previewImg').src=e.target.result; document.getElementById('previewImg').classList.remove('d-none'); }; r.readAsDataURL(this.files[0]); } }); }
function checkEditMode() {
    const id=localStorage.getItem('EDIT_TEMP_ID');
    if(id) { const p=getProducts().find(x=>x.id==id); if(p){ document.getElementById('pageTitle').innerText='Edit'; document.getElementById('editId').value=p.id; document.getElementById('itemName').value=p.name; document.getElementById('itemCategory').value=p.category; document.getElementById('itemStock').value=p.stock; document.getElementById('itemPrice').value=parseInt(p.price).toLocaleString('id-ID'); if(p.image){document.getElementById('previewImg').src=p.image;document.getElementById('previewImg').classList.remove('d-none');} } localStorage.removeItem('EDIT_TEMP_ID'); }
}
function openEditModal(id) { localStorage.setItem('EDIT_TEMP_ID', id); location.href='add-item.html'; }
function renderHistory() { const logs=JSON.parse(localStorage.getItem(HISTORY_KEY))||[]; const b=document.getElementById('historyTableBody'); b.innerHTML=''; logs.forEach(l=>b.innerHTML+=`<tr><td>${l.date}</td><td>${l.action}</td><td>${l.detail}</td></tr>`); if($.fn.DataTable.isDataTable('#historyTable')) $('#historyTable').DataTable().destroy(); $('#historyTable').DataTable({order:[[0,'desc']]}); }
window.clearAllHistory = function() { Swal.fire({title:'Bersihkan?', icon:'warning', showCancelButton:true}).then(r=>{ if(r.isConfirmed) { localStorage.removeItem(HISTORY_KEY); renderHistory(); Swal.fire('Bersih','','success'); } }); };
function loadProfileName() { /* Used by profile page logic */ }
function loadProfilePage() { const n=localStorage.getItem(PROFILE_KEY)||'Admin'; document.getElementById('displayName').innerText=n; document.getElementById('editNameInput').value=n; }
window.toggleEditProfile = function() { document.getElementById('viewMode').classList.toggle('d-none'); document.getElementById('editMode').classList.toggle('d-none'); };
window.saveProfile = function() { localStorage.setItem(PROFILE_KEY, document.getElementById('editNameInput').value); loadProfilePage(); toggleEditProfile(); Swal.fire('Tersimpan','','success'); };