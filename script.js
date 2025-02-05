// создадим объект с id операторов на странице, чтобы обращаться к ним по ключу и визуально показывать нажатие
const OPERATORS = {
    ['+']: 'plus',
    ['-']: 'minus',
    ['*']: 'times',
    ['/']: 'divide',
    ['Enter']: 'Enter',
    ['c']: 'clear',
    ['=']: 'Enter',
    ['0']: '0',
    ['1']: '1',
    ['2']: '2',
    ['3']: '3',
    ['4']: '4',
    ['5']: '5',
    ['6']: '6',
    ['7']: '7',
    ['8']: '8',
    ['9']: '9',
    ['.']: 'dot',
};

// для удобства добавим объект с ошибками, чтобы не приходилось в каждом месте редактировать текст ошибки
const ERRORS = {
    ['DIVISION_BY_ZERO']: 'Деление на ноль',
    ['INVALID_EXPRESSION']: 'Некорректное выражение'
};

// чтобы не загружать каждый раз для проверки приоритетов операторов, создадим объект с приоритетами, для доступа к ним по ключу
const PRIORITY = {
    ['^']: 3,
    ['/']: 2,
    ['*']: 2,
    ['+']: 1,
    ['-']: 1
}

// добавим функцию для визуализации нажатия кнопок
function trackingButtons(key) {
    // добавляем класс active к кнопке, которая была нажата
    $(`#${key}`).addClass('active');
    // через 100 мс удаляем класс active
    setTimeout(() => {
        $(`#${OPERATORS[key]}`).removeClass('active');
    }, 100); 
}

// добавим функцию для удаления последнего символа, для использования с клавиатуры
function backspace() {
    let current = $('#display').val();
    if (current.length > 1) { // если длина строки больше 1, то удаляем последний символ
        $('#display').val(current.slice(0, -1));
    }
    else { // иначе устанавливаем значение 0, чтобы не допускать пустого поля
        $('#display').val('0')
    }
}

$(document).ready(function() {
    $(document).on('keydown', function(event) {
        // во избежания непроизвольного выполнения действий по умолчанию, заблокируем их
        event.preventDefault();
        // Воспользуемся свойством key объекта event, чтобы определить, какая клавиша была нажата
        let key = event.key;
        // с помощью регулярного выражения проверим является ли нажатая клавиша цифрой или знаком
        if (/(^\d)|(^[\+\-\*\/\.])/.test(key)) {
            appendValue(key);
            trackingButtons(key);
        } else if (key === 'Enter' || key === '=') {
            trackingButtons('Enter');
            calculate();
        } else if (key === 'Backspace' || key === 'c' || key === 'C') {
            trackingButtons('c');
            backspace();
        }
    });
});

// добавим функцию для проверки является ли символ оператором
function isSign (char) {
    return char === '+' || char === '-' || char === '*' || char === '/';
}

// добавим функцию для обработки нажатия на кнопоки, которые мы сделали на странице
function appendValue(value) {
    const display = $('#display').val();
    const lastChar = display.slice(-1);

    // Строка не может начинаться с знака умножения, деления, плюса или нескольких нулей
    if ((display == '0' || display == ERRORS['DIVISION_BY_ZERO'] || display == ERRORS['INVALID_EXPRESSION']) && value != '.' && value != '+' && value != '*' && value != '/' && value != '0') {
        $('#display').val(value);
    }
    else {
        // для корректной обработки знака минус, если он находится сразу после предыдущего числа,
        // то этот знак - это оператор, если же он находится в начале строки или после другого оператора, то это знак числа. Пример : 5 - 5 (оператор) или 5\-5 (знак числа)
        if (!isSign(lastChar) && value == '-' && display != '0') {
            $('#display').val(display + ' ' + value + ' ');
        }
        else {
            $('#display').val(display + value);
        }

    }
}

// добавим функцию для полной очистки дисплея
function clearDisplay() {
    $('#display').val('0');
}

function calculate() {
    try {
        // Получение выражения из дисплея
        let expression = $('#display').val();
        // Передаем строку в функцию для обработки
        const result = parseExpression(expression);
        // Выводим результат в консоль
        console.log(result)
        // Выводим результат на дисплей
        $('#display').val(result);
    } catch (error) {
        // Выводим ошибку на дисплей
        $('#display').val(error);
        return;
    }
}


function parseExpression(expression) {
    // создаем стек для чисел и стек для операторов
    let stack = []
    let operators = []

    // функция для подготовки к вычислению конкретной операции. 
    // Находится внутри, чтобы создать замыкание на переменные stack и operators
    function calculateOperation() {
        // удалив и вернем последние два числа и оператор из стеков, воспользовавшись функцией .pop()
        let right = stack.pop();
        let left = stack.pop();
        let result = calc(left, right, operators.pop());
        stack.push(result);
    }
    // разбиваем строку на токены, используя регулярное выражение, которое собирает все числа и операторы в массив. Пример : '5 + 5' => ['5', '+', '5']
    let tokens = expression.match(/(-?\d+\.?\d*)|([\+\-\*\/])/g);
    // если токенов нет, то выражение некорректное
    if (!tokens) throw ERRORS['INVALID_EXPRESSION'];


    tokens.forEach(token => {
        if (/\d/.test(token)) { // если токен число, то добавляем его в стек чисел
            stack.push(parseFloat(token));
        } 
        else { // если токен оператор, то добавляем его в стек операторов
            // чтобы соблюсти порядок действий делаем проверку на приоритет операторов.
            // если приоритет последнего оператора в стеке больше или равен приоритету текущего оператора, то вычисляем последнее действие
            while (operators.length && PRIORITY[operators.slice(-1)] >= PRIORITY[token]) {
                calculateOperation();
            }
            // добавляем текущий оператор в стек операторов
            operators.push(token);
        }
    });
    // вычисляем оставшиеся действия
    while (operators.length) calculateOperation();
    return stack[0];
}

// функция для вычисления действия оператора и операндов
function calc(left, right, op) {
    switch(op) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            if (right === 0) throw ERRORS['DIVISION_BY_ZERO'];
            return left / right;
    }
}