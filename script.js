let allowedValues = new Set(); // 엑셀 데이터 저장

// 📂 엑셀 파일 업로드 처리
document.getElementById("fileInput").addEventListener("change", function(event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: "array" });

        // 첫 번째 시트 읽기
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // 첫 번째 열의 데이터 저장
        allowedValues.clear();
        rows.forEach(row => {
            if (row.length > 0) allowedValues.add(row[0].toString().trim());
        });

        alert("📂 엑셀 파일 업로드 완료!");
    };

    reader.readAsArrayBuffer(file);
});

// 📸 모바일 환경에서도 동작하도록 QR 코드 스캔 기능
async function startQRCodeScanner() {
    const video = document.getElementById("qr-video");
    const statusText = document.getElementById("status");

    // 후면 카메라 우선 사용
    const constraints = {
        video: { facingMode: "environment" }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            video.play();
            scanQRCode(); // 스캔 시작
        };
    } catch (error) {
        console.error("📸 카메라 접근 실패:", error);
        statusText.textContent = "❌ 카메라 사용 불가";
        return;
    }

    // QR 코드 스캔 처리
    function scanQRCode() {
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(scanQRCode);
            return;
        }

        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode) {
            let scannedValue = qrCode.data.trim();
            if (allowedValues.has(scannedValue)) {
                statusText.textContent = "✅ 인증 성공!";
                statusText.style.color = "green";
            } else {
                statusText.textContent = "❌ 인증 실패!";
                statusText.style.color = "red";
            }
        }

        requestAnimationFrame(scanQRCode);
    }
}

// 📸 모바일에서도 자동으로 QR 코드 스캔 시작
document.addEventListener("DOMContentLoaded", startQRCodeScanner);