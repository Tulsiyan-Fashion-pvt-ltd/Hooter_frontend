import styles from '../css/pages/EditInventory.module.css';
import {useState, useEffect, useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
import camera from '../assets/icons/upload_photo.svg';
import e from 'cors';

const route = import.meta.env.VITE_BASEAPI

export default function EditInventory() {
    const fixedFields = [
        { key: "sku_id", label: "SKU ID", required: true },
        { key: "title", label: "Product Title", required: true },
        { key: "price", label: "Product Price", required: true },
        { key: "compared_price", label: "Compared Price", required: true },
        { key: "discount", label: "Discount", required: false },
        { key: "purchasing_cost", label: "Purchasing Cost", required: false },
        { key: "vendor", label: "Vendor", required: false },
        { key: "ean", label: "EAN", required: false },
        { key: "hsn", label: "HSN", required: false },
        { key: "net_weight", label: "Net Weight", required: false },
        { key: "dead_weight", label: "Dead Weight", required: false },
        { key: "volumetric_weight", label: "Volumetric Weight", required: false },
        { key: "brand_name", label: "Brand Name", required: true },
    ];

    const [field, setField] = useState({});   // stores the value for the attribute demo{"sku_id": "data"}
    const [dynamicAttribute, setDynamicAttribute] = useState({}); // stores the attribute information for the catalog demo {"sku_id": "*"}
    const [imageAttribute, setImageAttribute] = useState({});  // {"front": [order, "*"]}
    const [imageField, setImageField] = useState({}); // storing data in {"front": {"image": object, "url": url, "order": integer}, ...}
    const [error, setError] = useState();
    const imageContainerRef = useRef();


    // console.log(imageField);

    

    const [searchParams, setSearchParams] = useSearchParams();

    /*  function section */
    function handleEntryInput(key, value){
        setField((prev)=>({...prev, [key]: value}));
    }

    // add custom image
    function addImageAttribute(key="custom"){
        const order = imageContainerRef.current.childElementCount;
        setImageAttribute((prev)=>({
            ...prev, [key]: [prev[key]? prev[key][0]: order, "custom"]
        }))
    }

    function renameImageAttribute(oldkey, newkey){
        setImageAttribute((prev)=> {
            const {[oldkey]: value, ...rest} = prev;
            return {...rest, [newkey]:value};
        })
    }


    function handleFile(key, order){
        const input = document.createElement('input');
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (e)=>{
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);

            setImageField((prev)=>({
                ...prev, [key]: {"image": file, "url": url, "order": order}
            }));
        }

        input.click();
    }


    async function handleURL(key, url, order){
        const response = await fetch(url);

        const image = await response.blob();

        setImageField((prev)=>({
            ...prev,
            [key]: {...prev.key, ["image"]: image, ["url"]: url}
        }));
    }


    /*
        fetch the attribute data from the server
    */
    useEffect(() => {
        const uskuId = searchParams.get("id");
        const type = searchParams.get("type");

        async function fetchAttribute() {
            try {
                const response = await fetch(`${route}/catalog/attribute-fields?type=${type}`, {
                    credentials: "include"
                });
                const data = await response.json();
                // console.log(data)

                if (!response.ok) {
                    throw new Error(data.msg || "Could not fetch the item details");
                    console.log(data);
                }

                setDynamicAttribute(data["field_attributes"]);
                setImageAttribute(data["image_attributes"]);
            }
            catch (e) {
                setError(e.message);
            }
        }
        
        

        fetchAttribute();
    }, [])

    useEffect(()=>{
        const uskuId = searchParams.get("id");
        // fetch the saved details from the server
        async function fetchCatalogData(){
            try {
                const [catalogResponse, imgResponse] = await Promise.all([fetch(`${route}/catalog?usku-id=${uskuId}`, {
                    credentials: "include"
                }), 
                fetch(`${route}/catalog/image?usku-id=${uskuId}`, {
                    credentials: "include"
                })]);


                const data = await catalogResponse.json();
                const images = await imgResponse.json();
                console.log(data)
                console.log(images)

                if (!catalogResponse.ok) {
                    throw new Error(data.msg);
                    console.log(data);
                }

                setField({...data})

                Object.keys(images).forEach((key)=>{
                    console.log(images[key]["web-webp_card"])
                    addImageAttribute(key);
                    handleURL(key, `${route}${images[key]["webp_card"]}`);
                })
            }
            catch (e){
                console.log(e);
                setError(e.message);
            }
            
        }

        fetchCatalogData();
    }, [dynamicAttribute]);

    return (
        <div className={styles.globalEditCatalogContainer}>
            <div className={styles.top}>
                <div className={styles.header}>
                    <h1 className={styles.heading}>Edit Catalog</h1>
                    <p className={styles.description}>
                        Edit your catalog information and add images for your product
                    </p>
                </div>

                <div className={styles.guidline}>
                    <p className={styles.fieldInformation}>
                        Mandatory Fields<span style={{ "color": "red" }}>*</span>
                    </p>

                    <div className={styles.guidlineTag}>
                        <p className={styles.guidlineText}>
                            ⚠ Follow the guidelines to reduce quality check
                        </p>
                    </div>
                </div>

                <hr style={{ marginTop: "1rem" }} />
            </div>

            {error && <div>{error.message || String(error)}</div>}

            <div className={styles.bottom}>
                <div className={styles.leftSection}>
                    <h2 className={styles.description}>Edit product details</h2>

                    <div className={styles.infoBox}>Fill in all required fields marked with *
                        <br></br>
                        <p className={styles.note}>Mandatory fields are marked with * and must be filled before submitting.</p>
                    </div>

                    <div className={styles.listingInfo}>
                        <h3 style={{"marginBottom": "10px"}}>Listing Information</h3>

                        <ul className={styles.productAttributeList}>
                            {
                                fixedFields.map(({ key, label, required }) => {
                                    return (
                                        <li className={styles.productAttribute} key={key}>
                                            <div className={styles.title} 
                                            style={required? {color: "red"}: {color: "black"}}
                                            >
                                                {label} {required?"*": ""}
                                            </div>
                                            <input type="text" placeholder='Type Here...' className={styles.attributeInputField} 
                                            value={field[key]? field[key]: ""}
                                            onChange={(e)=>{handleEntryInput(key, e.target.value)}}
                                            />
                                        </li>
                                    )
                                })
                            }
                        </ul>

                        <h3 style={{"marginBottom": "10px"}}>Product Information</h3>

                        <ul className={styles.productAttributeList}>
                            {
                                Object.entries(dynamicAttribute).map(([key, value]) => {
                                    const required = value === "*" || value.includes("*") ? true : false;
                                    const label = key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " ");
                                    const isDropdown = Array.isArray(value);

                                    const options = isDropdown
                                        ? value.filter((v) => v !== "*")
                                        : [];


                                    return (
                                        <li className={styles.productAttribute} key={key}>
                                            <div className={styles.title} 
                                            style={required? {color: "red"}: {color: "black"}}
                                            >
                                                {label} {required?"*": ""}
                                            </div>

                                            {isDropdown ? (<select
                                                value={field[key] || ""}
                                                onChange={(e) =>
                                                    handleEntryInput(key, e.target.value)
                                                }
                                                className={styles.selectField}
                                            >
                                                <option value="">Select...</option>
                                                {options.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>) : (
                                                <input type="text" placeholder='Type Here...' className={styles.attributeInputField}
                                                    value={field[key] ? field[key] : ""}
                                                    onChange={(e) => { handleEntryInput(key, e.target.value) }}
                                                />
                                            )}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>

                    <div className={styles.buttons}>
                        <button className={styles.draft}>Save as draft</button>
                        <button className={styles.submit}>Submit</button>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    <h2>Edit Images</h2>
                    <p className={styles.note}>Fields marked with * are required.</p>

                    <ul className={styles.imageContainer} ref={imageContainerRef}>
                        {
                            Object.entries(imageAttribute).map(([key, value]) => {
                                const label = key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " ") + (value.includes("*")? " *": "");

                                return (
                                    <li className={styles.imageCards} style={{order: value[0]}}>
                                        <input className={styles.imageTag} type="text" placeholder={label} 
                                        disabled={value.includes("custom")? false: true} 
                                        onChange={(e)=>{renameImageAttribute(key, e.target.value)}}
                                        value={label}/>

                                        <div className={styles.previewContainer}>
                                            <div className={styles.preview} style={imageField[key]? {backgroundImage: `url("${imageField[key].url}")`}: {backgroundImage: `url("${camera}")`}}
                                            onClick={()=>{handleFile(key, value[0])}}>
                                            </div>
                                            <p className={styles.imageNote}>Required</p>
                                        </div>

                                        <input type="text" placeholder='Image link' className={styles.imageFromLink}
                                        onChange={(e)=>{handleURL(key, e.target.value)}} />
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <button className={styles.moreImageBttn} onClick={()=>{addImageAttribute()}}>+ Add more image</button>
                </div>
            </div>
        </div>
    )
}