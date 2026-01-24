const route = import.meta.env.VITE_BASEAPI;

export async function session(){
    const response = await fetch(`${route}/session`);

    if (response.status == 200)
    {   console.log(response.status)
        return true
    }
    else{
        return false;
    }
}