const sendToBackend = async () => {
    const inputData = document.getElementById('url');
    const url = inputData.value;
    inputData.value = '';
    try {
        const result = await fetch('http://localhost:5000/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url
            })
        });
        const data = await result.json();
        const outputData = document.querySelectorAll('.response');
        console.log(data);
        outputData[0].innerHTML = data.url;
        outputData[1].innerHTML = data.domain;
        outputData[2].innerHTML = data.createdAt;
        outputData[3].innerHTML = data.updatedAt;
        outputData[4].innerHTML = data.expirationDate;
        outputData[5].innerHTML = data.registrar;
        outputData[6].innerHTML = data.reg_country;
    } catch (err) {
        console.log(err);
    }
}