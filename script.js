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
}