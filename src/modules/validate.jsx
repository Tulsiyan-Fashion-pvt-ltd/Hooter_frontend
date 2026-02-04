export function validateEmail(email){
    const emailRegex =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email);
}

export function validateInNumber(num){
    const numberRegex =  /^\d{10}$/;

    return numberRegex.test(num);
}

export function validatePincode(pin)
{
    const pincodeRegex = /^\d{6}$/;

    return pincodeRegex.test(pin);
}