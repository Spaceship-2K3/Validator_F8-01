// ! Constructor 'Validator'
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // ? Luu lai tat ca cac rules ma khong bi ghi de
    let selectorRules = {};

    // todo : lay element cua form can validate
    const formElement = document.querySelector(options.form);

    // todo : Ham thuc hien validate
    function validate(inputElement, rule) {
        const errorElement = getParent(
            inputElement,
            options.formGroupSelector
        ).querySelector(options.errorSelector);
        // todo : inputElement.value
        // todo : rule.test
        let errorMessage;
        // todo : lay qua cac rules cua selector
        let rules = selectorRules[rule.selector];

        // todo : lap qua tung rules (check)
        // todo : neu ma co loi thi dung viec kiem tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](
                        document.querySelector(rule.selector + ":checked")
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add(
                "invalid"
            );
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
                "invalid"
            );
        }

        return !errorMessage;
    }

    formElement.onsubmit = function (e) {
        e.preventDefault();

        var isFormValid = true;

        // todo : lap qua tung rules va validate
        options.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector);
            var isValid = validate(inputElement, rule);
            if (!isValid) {
                isFormValid = false;
            }
        });
        if (isFormValid) {
            // Trường hợp submit với javascript
            if (typeof options.onSubmit === "function") {
                var enableInputs = formElement.querySelectorAll("[name]");
                var formValues = Array.from(enableInputs).reduce(function (
                    values,
                    input
                ) {
                    switch (input.type) {
                        case "radio":
                            values[input.name] = formElement.querySelector(
                                'input[name="' + input.name + '"]:checked'
                            ).value;
                            break;
                        case "checkbox":
                            if (!input.matches(":checked")) {
                                values[input.name] = "";
                                return values;
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case "file":
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                },
                {});
                options.onSubmit(formValues);
            }
            // Trường hợp submit với hành vi mặc định
            else {
                formElement.submit();
            }
        }
    };

    // ! Lap qua moi rule va xu ly (lang nghe su kien blur , input,...)
    if (formElement) {
        options.rules.forEach(function (rule) {
            // todo : Luu lai cac rules vao trong object rong , cho moi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            const inputElements = formElement.querySelectorAll(rule.selector);
            [...inputElements].forEach((inputElement) => {
                if (inputElement) {
                    // todo : Xu li truong hop blur khoi input
                    inputElement.onblur = function () {
                        validate(inputElement, rule);
                    };

                    //todo : Xu li moi khi nguoi dung nhap vao input
                    inputElement.oninput = function () {
                        const errorElement = getParent(
                            inputElement,
                            options.formGroupSelector
                        ).querySelector(options.errorSelector);
                        errorElement.innerText = "";
                        getParent(
                            inputElement,
                            options.formGroupSelector
                        ).classList.remove("invalid");
                    };
                }
            });
        });
    }
}

// todo : do function cx la 1 object, dinh nghia cac rules
// todo : Nguyen tac cua cac rule :
// todo : 1. Khi co loi => Tra ra message loi
// todo : 2. Khi hop le => Tra ra undefined
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || "Vui long nhap truong nay";
        },
    };
};
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)
                ? undefined
                : message || "Vui long nhap Email";
        },
    };
};
Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : `Vui long nhap toi thieu ${min} ky tu`;
        },
    };
};
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue()
                ? undefined
                : message || "Gia tri nhap vao khong chinh xac";
        },
    };
};
