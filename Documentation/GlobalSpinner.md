# Gobal Loading Spinner

Global loading spinner is important especially while showing that an api 
request has been made for any perticular task.

## Problem with simply importing the <Spinner/> component everytime we need it

Reducing the amount of inserting the same component over and over again can
help the page load faster and feel less heavy.

I've implemented a `SpinnerContext` for so that 

1. You do not have to call the `<Spinner/>` over and over again.

2. You can just simply set the global spinner show value either `true` or `false` and you're good to go.


## Usage

Using the setShowSpinner function from the context is very easy.

__Importing context and useContext__
```
import {SpinnerContext} from 'relativepath/appContext';
import {useContext} from 'react';
```

__At the top of the function block__
```
const setShowSpinner = useContext(SpinnerContext);
```


__Inside the api calls__
```
try{
    setShowSpinner(true);
    // api call
}
catch(e){
    // handling exceptions
}
finally{
    setShowSpinner(false);
}
```


> Farhan 5th Oct 2026