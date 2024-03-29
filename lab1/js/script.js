let xValid = false, yValid = false, rValid = false;
var selectValidValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
var buttonValidValues = [1, 1.5, 2, 2.5, 3];

function validateSelection(value, validValues) {
    return validValues.includes(value);
}

const xSelect = document.getElementById('x');
xSelect.addEventListener('change', () => {
    const selectedXSelect = parseFloat(xSelect.value.replace(',', '.'));
    if (validateSelection(selectedXSelect, selectValidValues)) {
        xValid = true;
        xSelect.setCustomValidity(''); 
    } else {
        xValid = false;
        xSelect.setCustomValidity('Check the value.');
    }
    xSelect.reportValidity();
    toggleSubmitBtn();
});

const yInput = document.querySelector('input[name="y"]');
yInput.addEventListener('input', () => {
    yValid = false;
    if (yInput.value.length > 17) {
        yInput.value = yInput.value.slice(0, 17);
    }
    
    const regex = /^[0-9.,]+$/;
    if (!regex.test(yInput.value)) {
        yInput.setCustomValidity('Check the value.');
        yInput.reportValidity();
        toggleSubmitBtn();
        return;
    }

    const yValue = parseFloat(yInput.value.trim().replace(',', '.')); 
    if (isNaN(yValue)) {
        yInput.setCustomValidity('Check the value.');
    } else if (yValue < -3 || yValue > 5) {
        yInput.setCustomValidity('The value must be in the interval (-3 ... 5).');
    } else {
        yValid = true;
        yInput.setCustomValidity('');
    }
    yInput.reportValidity();
    toggleSubmitBtn();
});

let selectedRBtn;
const errorMessageBox = document.getElementById('error-message');
document.addEventListener("DOMContentLoaded", function () {
    const rBtns = document.querySelectorAll('.form__r-btn');
    
    rBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedValue = parseFloat(btn.value);
            rBtns.forEach(otherBtn => {
                otherBtn.classList.remove('selected-btn');
            });
            if (selectedValue !== selectedRBtn) {
                if (validateSelection(selectedValue, buttonValidValues)) {
                    btn.classList.add('selected-btn');
                    selectedRBtn = selectedValue;
                    rValid = true;
                    errorMessageBox.textContent = '';
                } else {
                    selectedRBtn = undefined;
                    rValid = false;
                    errorMessageBox.textContent = 'Check the value.';
                }
            } else {
                btn.classList.remove('selected-btn');
                selectedRBtn = undefined;
                rValid = false;
                errorMessageBox.textContent = 'Check the value.';
            }
            redrawGraph(selectedRBtn ? selectedRBtn : "R");
            toggleSubmitBtn();
        });
    });
});




const submitBtn = document.querySelector('.form__big-btn[type="submit"]');
function toggleSubmitBtn() {
    submitBtn.disabled = !(xValid && yValid && rValid)
}

function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}

const tbody = document.querySelector('.main__table tbody');

const form = document.querySelector('.form');
form.addEventListener('submit', e => {
    e.preventDefault();
    let params = {
        'x': xSelect.value,
        'y': yInput.value,
        'r': selectedRBtn
    }
    const target = 'php/submit.php' + formatParams(params)

    const xhr = new XMLHttpRequest();
    xhr.open('GET', target);

    xhr.onloadend = () => {
        if (xhr.status === 200) {
            // window.location.href = "table.html";
            tbody.innerHTML = xhr.response;
            
            let isHit = document.querySelector('tbody tr:last-child td:last-child span').classList.contains('hit')
            printDotOnGraph(xSelect.value, yInput.value, isHit)
        } else {
            console.log("status: ", xhr.status);
            if (xhr.status >= 400 && xhr.status < 600) {
                errorMessageBox.textContent = `An error has occurred: ${xhr.status} - ${xhr.statusText}`;
            }
        }
    };
    xhr.send();
})

// Clear 
const clearBtn = document.querySelector('.form__big-btn[type="reset"]');
clearBtn.addEventListener("click", e => {
    e.preventDefault();

    let xhr = new XMLHttpRequest();
    xhr.onloadend = () => {
        if (xhr.status === 200) {
            tbody.innerHTML = '';
        } else {
            console.log("status: ", xhr.status);
            if (xhr.status >= 400 && xhr.status < 600) {
                errorMessageBox.textContent = `An error has occurred: ${xhr.status} - ${xhr.statusText}`;
            }
        }
    };
    xhr.open("POST", "php/clear.php");
    xhr.send();
})


// Previous table data 
window.onload = () => {
    let xhr = new XMLHttpRequest();
    xhr.onloadend = () => {
        if (xhr.status === 200) {
            const tbody = document.querySelector('.main__table tbody');
            tbody.innerHTML = xhr.response;
        } else {
            console.log("status: ", xhr.status);
            if (xhr.status >= 400 && xhr.status < 600) {
                errorMessageBox.textContent = `An error has occurred: ${xhr.status} - ${xhr.statusText}`;
            }
        }
    };
    xhr.open("GET", "php/init.php");
    xhr.send();
}