//Doi tuong Validator
function Validator(options) {
  // element class form cần validate
  var formElement = document.querySelector(options.form);

  // Lấy ra các rules của selector
  var selectorRules = {};

  var isFormValid = true;

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }

      element = element.parentElement;
    }
  }
  // console.log(options.rules)
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    //Lay the span hien thong bao loi
    // console.log(inputElement.parentElement.querySelector('.form-message'))

    var messageError;
    // Lay ra cac rule cua selector
    // selctorRules da duoc push vao o if(formElement)
    var rules = selectorRules[rule.selector];
    // console.log(selectorRules[rule.selector])

    // Duyen qua tung rule neu co loi thi dung kiem tra
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          messageError = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;

        default:
          messageError = rules[i](inputElement.value);
      }
      if (messageError) break; // neu co loi thi dung kiem tra
    }

    //Foreach khong dc break
    // selectorRules[rule.selector].forEach( function(rule) {
    //   messageError = rule.test(inputElement.value);
    //   if(messageError) break;
    // })

    errorElement.classList.add(".invalid");

    if (messageError) {
      errorElement.innerText = messageError;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }

    return messageError;
  }

  if (formElement) {
    formElement.onsubmit = function (event) {
      event.preventDefault();
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);

        // Array.from(inputElements).forEach(function (inputElement) {});
        // console.log(inputElement, rule)

        var isValid = validate(inputElement, rule);

        // console.log(isValid)
        //
        if (isValid == "undefined") {
          isFormValid = false;
          // console.log(isFormValid)
        }
      });

      if (isFormValid) {
        // Truong hop submit vs javascript
        // console.log(typeof options.onSubmit)
        // Select tat ca co field la 'name' va khon co field la disabled
        var enableInputs = document.querySelectorAll("[name]:not([disabled])");
        if (typeof options.onSubmit === 'function') {
          var formValues = Array.from(enableInputs).reduce(function (values, input) {
              
              switch(input.type) {
                  case 'radio':
                      values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                      break;
                  case 'checkbox':
                    //Chưa làm được
                      if (!input.matches(':checked')) {
                          //Sai
                          // values[input.name] = '';
                          return values;
                      }
                      if (!Array.isArray(values[input.name])) {
                          values[input.name] = [];
                      }
                      values[input.name].push(input.value);
                      break;
                  case 'file':
                      values[input.name] = input.files;
                      break;
                  default:
                      values[input.name] = input.value;
              }

              return values;
          }, {});
          options.onSubmit(formValues);
      }
      // Trường hợp submit với hành vi mặc định
      else {
          formElement.submit();
      }
      }
    };

    options.rules.forEach(function (rule) {
      // Lưu lại tất cả các rule nếu không có dòng này thì rule sẽ bị ghi đè
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      // lay input element cua form duoc truyen vao
      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          //Xu ly khi ng dung blur
          inputElement.onblur = function (e) {
            validate(inputElement, rule);
          };

          //Xu ly truong hop khi nguoi dung dang nhap vao input
          inputElement.oninput = function (e) {
            var errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
        }
      });
    });
  }
}

//Dinh nghia rules
//Nguyen tac cua cac rule
/* 1.Khi co loi => Tra ra messege loi
    2.Khi khong co loi => khong tra gi*/
Validator.isRequired = function (selector, message) {
  return {
    selector,
    test: function (value) {
      // if(value.trim())
      // {
      //     console.log(true)
      // }else  {
      //      console.log(false)
      // }
      // value.trim() loai bo tat ca dau space

      // console.log(value.trim() + "Vuong")

      return value ? undefined : message || "Vui long nhap truong nay!";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector,
    test: function (value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Trường này phải là email!";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Vui long nhap toi thieu ${min} ky tu!`;
    },
  };
};

Validator.isConfirmed = function (selector, password, message) {
  return {
    selector,
    test: function (value) {
      // console.log(password())
      return value === password()
        ? undefined
        : message || "Nhap lai mat khau khong chinh xac!";
    },
  };
};
