let toggle = document.querySelector('.toggle');
let navigation = document.querySelector('.navigation');
let main = document.querySelector('.main');

let list = document.querySelectorAll('.navigation li');

// const ctx2 = document.getElementById('myChart2');
const ctx3 = document.getElementById('myChart3');

const body = document.querySelector('body');

const totalAmount = document.querySelector('.totalAmount');
const totalProjects = document.querySelector('.totalProjects');
const totalPercents = document.querySelector('.totalPercents');

function activeLink() {
    list.forEach((item) => {
        item.classList.remove('hovered');
        this.classList.add('hovered');
    })
}

list.forEach((item) => item.addEventListener('click', activeLink));

toggle.onclick = function() {
    navigation.classList.toggle('active');
    main.classList.toggle('active');
}

let graph = null;
let myChart3 = null;

fetch('http://localhost:3000/graphs', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json()) 
  .then(datas => {
    let items = datas.graphName2.items;
    let maxValue = datas.maxValue;
    const data = {
        labels: items.map(item => item.name),
        datasets: [{
        data: items.map(item => item.value),
        backgroundColor: items.map(item => getRandomColor()),
        }]
    };
    target.innerHTML = maxValue;
    graph = new RowGraph(document.querySelector('#container'), items, maxValue);
     
    myChart3 = new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: [...data.labels],
            datasets: [...data.datasets],
        },
        options: {
            responsive: true, 
        }
    });
    Chart.defaults.plugins.legend.display = false; 
    totalAmount.innerHTML = getSum();
    totalProjects.innerHTML = getTotalProjects();
    totalPercents.innerHTML = getTotalPercents();
    createProjectList();
  })
  .catch(error => {
    console.error('Ошибка:', error);
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// const items = [
//     { value: 45000, name: 'name' }, 
//     { value: 300000, name: 'name' }, 
//     { value: 25000, name: 'name' },
//     { value: 0, name: 'name' },
//     { value: 0, name: 'name' },
//     { value: 52000, name: 'name' },
//     { value: 60000, name: 'name' },
//     { value: 65000, name: 'name' },
//     { value: 35000, name: 'name' },
//     { value: 55000, name: 'name' },
//     { value: 55000, name: 'name' },
//     { value: 40000, name: 'name'},
//     { value: 30000, name: 'name' },
//     { value: 5000, name: 'name' },
//     { value: 40000, name: 'name' },
//     { value: 38000, name: 'name'},
// ];

// Chart.defaults.plugins.legend.maxHeight = 900;
// const myChart2 = new Chart(ctx2, {
//     type: 'doughnut',
//     data: {
//         labels: [...data.labels],
//         datasets: [...data.datasets],
//     },
//     options: {
//       responsive: true, 
//     },
// });


const target = document.querySelector('.target');
const inputTarget = document.querySelector('.inputTarget');
const addTargetBtn = document.querySelector('.addTargetBtn');

addTargetBtn.addEventListener('click', (e) => {
    target.innerHTML = inputTarget.value;   
    const items = graph.items; 
    updateTotalPercents();
    graph = null;
    graph = new RowGraph(document.querySelector('#container'), items, inputTarget.value);
})

// const totalAmount = document.querySelector('.totalAmount');
// totalAmount.innerHTML = getSum();

class RowGraph {
    items = [];
    container = null;
    // colors = ['yellow', 'green', 'blue', 'gray', 'purple', 'red'];
    max = 0;
    length = 0;
    
    constructor(container, items, max) {
        this.items = items;
        this.max = max;
        this.container = container;
        this.container.innerHTML = "";
        items.forEach(({ value, name }, i) => {
            this._insertItem(value, name, i);
        })
    }

    setMax(max) {
        this.max = max;
    }

    _getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
  
    _setWidth = (el, value) => el.style.width = `${this._getPercentValue(value)}%`;
    
    _getPercentValue = (val) => (val * 100 / this.max).toFixed(1);
    
    _insertItem(value, name, i) {
            const el = document.createElement('div');
            if(value) {
                el.classList.add('box'); //dsadsa
                // el.addEventListener('dblclick', (e) => {
                //     this.container.removeChild(el);
                // })
                this._setWidth(el, value);
                // const colorIndex = i !== undefined ? i : this.length;
                // el.style.background = this.colors[colorIndex];
                el.style.background = this._getRandomColor();
                // el.innerHTML = `${name} : ${this._getPercentValue(value)}%`;
                el.append(this._createLabelElement(name, this._getPercentValue(value)));
            }
            this.container.appendChild(el);
            this.length++;
        // }
    }

    _createLabelElement(name, value) {
        const labelContainer = document.createElement('div');
        const label = document.createElement('p');
        const percent = document.createElement('span');

        label.innerHTML = name;
        percent.innerHTML = `${value}%`;

        labelContainer.append(label);
        labelContainer.append(percent);

        return labelContainer;
    }

    // _setName(el, name, value) {
    //     // el.innerHTML = `${name} : ${this._getPercentValue(value)}%`;
    // }
    
    addItem(value, name) {
        this._insertItem(value, name);
        // this.updateTotalAmount();
        fetch('http://localhost:3000/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({value, name})
          })
          .then(response => response.json())
          .then(data => {
            console.log('Данные успешно отправлены на сервер!');
          })
          .catch(error => {
            console.error('Произошла ошибка при отправке данных на сервер:', error);
          });
    }
    
    remove(index) {
        const child = this.container.children[index];
        this.container.removeChild(child);
        this.length--;
        // this.updateTotalAmount();
        fetch('http://localhost:3000/remove', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({index})
          })
          .then(response => response.json())
          .then(data => {
            console.log('Данные успешно отправлены на сервер!');
          })
          .catch(error => {
            console.error('Произошла ошибка при отправке данных на сервер:', error);
          });
    }
    
    update(index, value) {
        const children = this.container.children[index];
        if (children) {
            this._setWidth(this.container.children[index], value);
            // this._setName(children, value);
            // children.children[0].children[1].innerHTML = this._getPercentValue(value);
            children.querySelector('span').innerHTML = `${this._getPercentValue(value)}%`;
            // this.updateTotalAmount();
            fetch('http://localhost:3000/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({index, value})
              })
              .then(response => response.json())
              .then(data => {
                console.log('Данные успешно отправлены на сервер!');
              })
              .catch(error => {
                console.error('Произошла ошибка при отправке данных на сервер:', error);
            });
        }
    }
}

// let graph = new RowGraph(document.querySelector('#container'), items, +target.textContent);

const overlay = document.querySelector('.overlay');
const signIn = document.querySelector('.signIn');
const xmark = document.querySelector('.xmark');
const popupSignIn = document.querySelector('.popupSignIn');

signIn.addEventListener('click', (e) => {
    overlay.classList.add('active'); 
    popupSignIn.style.display = 'flex';
    body.style.overflow = 'hidden';
})

xmark.addEventListener('click', (e) => {
    overlay.classList.remove('active'); 
    popupSignIn.style.display = 'none';
    body.style.overflow = 'visible';
})

const passwordContainer = document.querySelector('.password');
const passwordInput = document.querySelector('.passwordInput');
const passwordBtn = document.querySelector('.passwordBtn');
const settings = document.querySelector('.settings');

let truePassword = 'bngraphs2014';

passwordBtn.addEventListener('click', (e) => {
    const errorPassword = document.createElement('p');
    errorPassword.className = 'errorPassword';
    errorPassword.innerHTML = 'Wrong password!';
    if (passwordInput.value === truePassword) {
        passwordContainer.style.display = 'none';
        settings.style.display = 'flex';
        const errorsPasswords = document.querySelectorAll('.errorPassword');
        errorsPasswords.forEach((item) => {
            item.remove();
        })
    } else {
        passwordContainer.append(errorPassword);
    }
})

const inputNameBar = document.querySelector('.inputNameBar');
const inputValueBar = document.querySelector('.inputValueBar');
const addProjectBtnBar = document.querySelector('.addProjectBtnBar');
const inputIndexBar = document.querySelector('.inputIndexBar');
const removeValueBtnBar = document.querySelector('.removeValueBtnBar');
const changeValueBtnBar = document.querySelector('.changeValueBtnBar');

let addProject = function(value, label, myChart) {
    const color = getRandomColor(); 

    myChart.data.datasets[0].data.push(+value);
    myChart.data.labels.push(label);
    myChart.data.datasets[0].backgroundColor.push(color);
    myChart.update();
    updateProjectList(myChart.data.labels);
}

let removeProject = function(index, myChart) {
    myChart.data.datasets[0].data.splice(index, 1);
    myChart.data.labels.splice(index, 1);
    myChart.data.datasets[0].backgroundColor.splice(index, 1);
    myChart.update();
    updateProjectList(myChart.data.labels);
}

let changeValue = function(index, newValue, myChart) {
    myChart.data.datasets[0].data[index] = +newValue;
    myChart.update();
}

addProjectBtnBar.addEventListener('click', (e) => {
    addProject(inputValueBar.value, inputNameBar.value, myChart3);
    // addProject(inputValueBar.value, inputNameBar.value, myChart2);
    graph.addItem(+inputValueBar.value, inputNameBar.value); 
    updateTotalAmount();
    updateTotalProjects();
});
 
removeValueBtnBar.addEventListener('click', (e) => {
    // const index = inputIndexBar.value;
    removeProject(inputIndexBar.value, myChart3);
    // removeProject(inputIndexBar.value, myChart2);
    graph.remove(inputIndexBar.value);
    updateTotalAmount();
    updateTotalProjects();
});

changeValueBtnBar.addEventListener('click', (e) => {
    changeValue(inputIndexBar.value, inputValueBar.value, myChart3);
    // changeValue(inputIndexBar.value, inputValueBar.value, myChart2);
    graph.update(+inputIndexBar.value, +inputValueBar.value);
    updateTotalAmount();
    updateTotalProjects();
});

function getSum() {
    let sum = 0;
    myChart3.data.datasets[0].data.forEach(item => {
      sum += item;
    });
    return sum;
}

function updateTotalAmount() {
    totalAmount.innerHTML = getSum();
    updateTotalPercents();
}

function getTotalProjects() {
    let sum = myChart3.data.datasets[0].data.length;
    return sum;
}

function updateTotalProjects() {
    totalProjects.innerHTML = getTotalProjects();
}

function getTotalPercents() {
    let sumPercents = (getSum() * 100 / +target.textContent).toFixed(2);
    return sumPercents;
}

function updateTotalPercents() {
    totalPercents.innerHTML = getTotalPercents();
}

const projectList = document.querySelector('.project_list');

function createProjectList() {
    myChart3.data.labels.forEach((item, index) => {
        const projectListItem = document.createElement('p');
        projectListItem.innerHTML = `${index} - ${item}`;
        projectList.append(projectListItem);
    })
}

function updateProjectList(labels) {
    projectList.innerHTML = "";
    labels.forEach((item, index) => {
        const projectListItem = document.createElement('p');
        projectListItem.innerHTML = `${index} - ${item}`;
        projectList.append(projectListItem);
    })
}




