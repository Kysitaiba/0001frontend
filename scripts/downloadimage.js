/**
 * Script JavaScript lấy tất cả các URL ảnh (bao gồm cả WebP)
 * từ các thẻ <img> và kích hoạt tải xuống.
 */
function downloadAllImagesAdvanced() {
    // 1. Lấy tất cả các thẻ <img> và <source> (cho thẻ <picture>)
    const elements = document.querySelectorAll('img, source');

    if (elements.length === 0) {
        console.log("Không tìm thấy thẻ <img> hoặc <source> nào trong DOM.");
        alert("Không tìm thấy thẻ <img> hoặc <source> nào trong DOM.");
        return;
    }

    const imageUrlsToDownload = new Set(); // Dùng Set để tránh trùng lặp URL
    
    // 2. Lọc và thu thập tất cả các URL ảnh hợp lệ
    elements.forEach(el => {
        let url = '';
        
        // Kiểm tra thẻ <img>
        if (el.tagName === 'IMG') {
            // Ưu tiên src (ảnh đã tải)
            if (el.src) {
                url = el.src;
            } 
            // Kiểm tra các thuộc tính lazy-loading phổ biến
            else if (el.dataset.src) {
                url = el.dataset.src; // Ví dụ: data-src
            } else if (el.getAttribute('data-lazy-src')) {
                url = el.getAttribute('data-lazy-src');
            }
        } 
        // Kiểm tra thẻ <source> (thường dùng trong <picture> cho ảnh WebP/khác)
        else if (el.tagName === 'SOURCE') {
            if (el.srcset) {
                // Lấy URL đầu tiên (hoặc URL lớn nhất) từ srcset
                const sources = el.srcset.split(',').map(s => s.trim().split(/\s+/)[0]);
                if (sources.length > 0) {
                    // Lấy URL đầu tiên làm đại diện
                    url = sources[0]; 
                }
            }
        }

        // Đảm bảo URL là chuỗi không rỗng và thêm vào Set
        if (url && url.startsWith('http')) {
            imageUrlsToDownload.add(url);
        } else if (url && url.startsWith('/') && !url.startsWith('//')) {
             // Xử lý các đường dẫn tương đối, ví dụ: "/wp-content/uploads/..."
             // Phải thêm domain hiện tại để tạo URL tuyệt đối
             try {
                 const absoluteUrl = new URL(url, window.location.origin).href;
                 imageUrlsToDownload.add(absoluteUrl);
             } catch (e) {
                 console.warn(`Không thể tạo URL tuyệt đối từ đường dẫn: ${url}`);
             }
        }
    });

    const uniqueUrls = Array.from(imageUrlsToDownload);

    if (uniqueUrls.length === 0) {
        console.log("Không tìm thấy URL ảnh hợp lệ nào để tải xuống.");
        return;
    }
    
    console.log(`Tìm thấy ${uniqueUrls.length} URL ảnh duy nhất. Bắt đầu tải xuống...`);

    // 3. Thực hiện tải xuống cho từng URL đã thu thập
    uniqueUrls.forEach((imageUrl, index) => {
        
        console.log(`Đang xử lý ảnh [${index + 1}/${uniqueUrls.length}]: ${imageUrl}`);

        fetch(imageUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const objectURL = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = objectURL;

                // Cố gắng đặt tên file từ URL (hỗ trợ .webp)
                let filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split('?')[0].split('#')[0];
                if (!filename || filename.indexOf('.') === -1) {
                    // Đảm bảo file có tên và phần mở rộng
                    filename = `image_${index + 1}.${blob.type.split('/')[1] || 'webp'}`; 
                }
                link.download = filename;

                // Kích hoạt tải xuống
                document.body.appendChild(link);
                link.click();

                // Dọn dẹp
                document.body.removeChild(link);
                URL.revokeObjectURL(objectURL);

                console.log(`Đã kích hoạt tải xuống cho: ${filename}`);
            })
            .catch(error => {
                console.error(`Không thể tải xuống ảnh từ ${imageUrl}:`, error);
            });
    });
}

// KHÔNG GỌI HÀM NÀY TỰ ĐỘNG. VUI LÒNG CHẠY TRONG CONSOLE: downloadAllImagesAdvanced()
downloadAllImagesAdvanced()