// чтобы не загружать каждый раз для проверки приоритетов операторов, создадим объект с приоритетами, для доступа к ним по ключу
const PRIORITY = {
    ['^']: 3,
    ['/']: 2,
    ['*']: 2,
    ['+']: 1,
    ['-']: 1
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
    // Получение выражения из дисплея
    let expression = $('#display').val();
    // Вывод в консоль
    console.log(expression)
    // Передаем строку в функцию для обработки
    try {
        parseExpression(expression);
    } catch (error) {
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
    if (!tokens) throw 'Некорректное выражение';


    tokens.forEach(token => {
        if (/\d/.test(token)) { // если токен число, то добавляем его в стек чисел
            stack.push(parseFloat(token));
        } 
        else { // если токен оператор, то добавляем его в стек операторов
            operators.push(token);
        }
    });
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
            if (right === 0) throw 'Деление на ноль';
            return left / right;
    }
}