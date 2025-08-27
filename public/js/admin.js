// public/js/admin.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js';

// Thay thế với cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Các phần tử DOM
const adminPanel = document.getElementById('admin-panel');
const adminLoginForm = document.getElementById('adminLoginForm');
const addProductForm = document.getElementById('addProductForm');
const adminLoginModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
const loginErrorDiv = document.getElementById('loginError');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Hàm hiển thị/ẩn panel admin
function toggleAdminPanel(user) {
    if (user && user.email === 'admin@example.com') { // Thay 'admin@example.com' bằng email admin của bạn
        adminPanel.style.display = 'block';
    } else {
        adminPanel.style.display = 'none';
    }
}

// Lắng nghe trạng thái xác thực
onAuthStateChanged(auth, (user) => {
    toggleAdminPanel(user);
    if (user && user.email === 'admin@example.com') {
        console.log("Admin đã đăng nhập:", user.email);
        adminLoginModal.hide(); // Ẩn modal nếu đã đăng nhập
    } else {
        console.log("Admin chưa đăng nhập hoặc không có quyền.");
    }
});

// Xử lý đăng nhập Admin
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = adminLoginForm['adminEmail'].value;
    const password = adminLoginForm['adminPassword'].value;

    loginErrorDiv.textContent = ''; // Xóa thông báo lỗi cũ

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Đăng nhập thành công:", userCredential.user.email);
        if (userCredential.user.email === 'admin@example.com') { // Kiểm tra lại quyền admin
            adminLoginModal.hide();
            adminLoginForm.reset(); // Reset form
            alert('Đăng nhập Admin thành công!');
        } else {
            // Nếu không phải admin, đăng xuất ngay lập tức
            await signOut(auth);
            loginErrorDiv.textContent = 'Bạn không có quyền Admin.';
        }

    } catch (error) {
        console.error("Lỗi đăng nhập:", error.message);
        let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Email hoặc mật khẩu không đúng.";
        }
        loginErrorDiv.textContent = errorMessage;
    }
});

// Xử lý đăng xuất Admin
adminLogoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        alert('Đăng xuất Admin thành công!');
        adminPanel.style.display = 'none'; // Ẩn bảng điều khiển admin
        console.log("Admin đã đăng xuất.");
        // Có thể load lại trang hoặc cập nhật giao diện
        // window.location.reload();
    } catch (error) {
        console.error("Lỗi đăng xuất:", error.message);
        alert('Có lỗi khi đăng xuất. Vui lòng thử lại.');
    }
});


// Xử lý thêm sản phẩm mới
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== 'admin@example.com') {
        alert('Bạn không có quyền để thêm sản phẩm.');
        return;
    }

    const name = addProductForm['productName'].value;
    const description = addProductForm['productDescription'].value;
    const price = parseFloat(addProductForm['productPrice'].value);
    const imageFile = addProductForm['productImage'].files[0];

    if (!name || !description || isNaN(price) || !imageFile) {
        alert('Vui lòng điền đầy đủ thông tin sản phẩm và chọn hình ảnh.');
        return;
    }

    try {
        // 1. Upload hình ảnh lên Firebase Storage
        const storageRef = ref(storage, `product_images/${imageFile.name}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        // 2. Lưu thông tin sản phẩm vào Cloud Firestore
        await addDoc(collection(db, 'products'), {
            name,
            description,
            price,
            imageUrl,
            createdAt: new Date()
        });

        alert('Sản phẩm đã được thêm thành công!');
        addProductForm.reset(); // Reset form
        // Có thể gọi lại hàm loadProducts() từ main.js để cập nhật danh sách
        // window.location.reload(); // Cách đơn giản để refresh
        // Hoặc bạn có thể tạo một sự kiện tùy chỉnh và lắng nghe trong main.js
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm: ", error);
        alert('Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.');
    }
});
