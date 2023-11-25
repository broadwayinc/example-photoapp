function displayLoader() {
    let bk = document.createElement('div');
    bk.id = 'bk';

    let bkStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: '9999',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: '20px'
    }
    
    for (let key in bkStyle) {
        bk.style[key] = bkStyle[key];
    }

    bk.innerHTML = 'Uploading...';
    
    let percent = document.createElement('span');
    percent.id = 'percent';
    percent.style.marginLeft = '20px';
    percent.innerHTML = '0%';
    bk.appendChild(percent);
    document.body.appendChild(bk);
    return percent;
}

function hideLoader() {
    document.getElementById('bk').remove();
}