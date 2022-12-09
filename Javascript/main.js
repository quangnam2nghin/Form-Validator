// Doi tuong
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  // ham validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSlector);
    var errorMessage;
    // lay cac rules cua selector
    var rules = selectorRules[rule.selector];

    // lap qu atung rule & kiem tra
    // neu co loix thi dung kiem tra
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
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
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      // lap qua tung rule va validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);

        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Truong hop submit voi Javascript
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
                  values[input.name] = [];
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
        } else {
          // submit voi hanh vi mac dinh
          formElement.submit();
        }
      }
    };

    // xu lys lap qua moi rules
    options.rules.forEach(function (rule) {
      // luu lai cac rule
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // thuc hien oninput
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSlector);
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      });
    });
  }
}

// dinh nghia
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      return regex.test(value)
        ? undefined
        : message || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isCofirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Gía trị nhập lại không chính xác";
    },
  };
};
