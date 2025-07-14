// Simple fallback if main modules fail to load
window.addEventListener('DOMContentLoaded', () => {
    // Check if main.js loaded successfully
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen')
        const loadingProgress = document.querySelector('.loading-progress')
        const loadingPercentage = document.querySelector('.loading-percentage')
        
        if (loadingProgress && loadingPercentage.textContent === '0%') {
            console.log('Fallback loading initiated...')
            
            // Simulate loading progress
            let progress = 0
            const interval = setInterval(() => {
                progress += Math.random() * 15
                if (progress >= 100) {
                    progress = 100
                    clearInterval(interval)
                    
                    setTimeout(() => {
                        loadingScreen.classList.add('hidden')
                        setTimeout(() => {
                            loadingScreen.style.display = 'none'
                            showFallbackMessage()
                        }, 500)
                    }, 300)
                }
                
                loadingProgress.style.width = progress + '%'
                loadingPercentage.textContent = Math.round(progress) + '%'
            }, 200)
        }
    }, 3000) // Wait 3 seconds before fallback
})

function showFallbackMessage() {
    const canvas = document.getElementById('webgl-canvas')
    canvas.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    canvas.style.display = 'flex'
    canvas.style.alignItems = 'center'
    canvas.style.justifyContent = 'center'
    canvas.style.fontSize = '24px'
    canvas.style.color = 'white'
    canvas.style.textAlign = 'center'
    canvas.innerHTML = `
        <div style="max-width: 600px; padding: 40px;">
            <h2 style="margin-bottom: 20px;">🚗 3D Car Portfolio</h2>
            <p style="margin-bottom: 15px;">Your interactive 3D portfolio is ready!</p>
            <p style="font-size: 16px; opacity: 0.8;">WebGL dependencies are loading. Please refresh the page to experience the full 3D car driving portfolio.</p>
            <button onclick="location.reload()" style="
                margin-top: 20px;
                padding: 12px 24px;
                background: #ff4757;
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                🔄 Reload Portfolio
            </button>
        </div>
    `
}
