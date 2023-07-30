let Input = {};

export default Input;


window.onkeydown = (evt) => {
   // evt.preventDefault();
    Input[evt.key] = true;
}
window.onkeyup = (evt) => {
   // evt.preventDefault();
    Input[evt.key] = false;
}

