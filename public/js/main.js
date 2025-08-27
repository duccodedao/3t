// public/js/main.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Thay thế với cấu hình Firebase của bạn
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCr5195KxCtcFBj31zYe9Qc1ZDxEC4Ov4",
  authDomain: "thanh-ea958.firebaseapp.com",
  projectId: "thanh-ea958",
  storageBucket: "thanh-ea958.firebasestorage.app",
  messagingSenderId: "593756294921",
  appId: "1:593756294921:web:b7ac2aa773ca05c845cdd8",
  measurementId: "G-1Q0D96D7LS"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productListDiv = document.getElementById('product-list');

async function loadProducts() {
    productListDiv.innerHTML = '<div class="col-12 text-center text-muted">Đang tải sản phẩm...</div>';
    try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        const productItems = productSnapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="col">
                    <div class="card h-100 product-card">
                        <img src="${data.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}" class="card-img-top" alt="${data.name}">
                        <div class="card-body">
                            <h5 class="card-title">${data.name}</h5>
                            <p class="card-text">${data.price.toLocaleString('vi-VN')} VNĐ</p>
                            <a href="#" class="btn btn-sm btn-primary mt-2"><i class="fas fa-shopping-cart"></i> Thêm vào giỏ</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        productListDiv.innerHTML = productItems;
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm: ", error);
        productListDiv.innerHTML = '<div class="col-12 text-center text-danger">Không thể tải sản phẩm. Vui lòng thử lại sau.</div>';
    }
}

// Tải sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', loadProducts);
