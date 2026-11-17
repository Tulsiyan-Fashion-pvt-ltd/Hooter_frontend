import { store } from "../store/store";
const host = import.meta.env.VITE_BASEAPI;



/**
 * Upload variants
 * @param {object} variants 
 * @returns string of message when upload status code is > 400
 */
export async function uploadProductVariants(variants, uskuId) {
    const csrfToken = store.getState().csrf.csrf;

    const variantsData = []

    for (const variant of variants) {
        const variantData = {}

        for (const attributeType of Object.keys(variant)) {
            variantData[attributeType] = {};

            for (const variantAttribute of variant[attributeType]) {
                if (variantAttribute.error) {
                    throw new Error("Enter correct value for the vriant field");
                };

                variantData[attributeType][variantAttribute.field] = variantAttribute.value;
            }
        }

        variantsData.push(variantData);   // pushing the variant data to the lists of variants
    }

    console.log(JSON.stringify(variantsData))

    try {
        const response = await fetch(`${host}/catalog/variants/${uskuId}`, {
            headers: {
                "X-CSRF-Token": csrfToken,
                "Content-Type": "application/json"
            },
            "credentials": "include",
            method: "POST",
            body: JSON.stringify({"variants": variantsData})
        })

        const data = await response.json()

        if (response.status > 400){
            console.error(data.message ?? "Variants upload vailed");
            throw new Error(data.message ?? "Variants upload vailed");
        }

        return data.message;
    }
    catch (e) {
        console.log(e);
        throw new Error("Variants upload failed");
    }
}



/**
 * Fetch product variants for the USKU ID
 * @param {string} uksuId
 */
export async function fetchProductVariants(uskuId) {
    try {
      const response = await fetch(`${host}/catalog/variants/${uskuId}`, {
        "credentials": "include"
      })
      const data = await response.json();

      if (!response.ok) throw new Error(data?.message ?? "Could not fetch the product variants", "red");

      return data;
    }
    catch (e) {
      console.error(e);
      throw new Error('Could not fetch product variants');
    }
  }