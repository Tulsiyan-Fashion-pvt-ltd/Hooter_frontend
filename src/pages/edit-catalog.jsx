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
    const [imageAttribute, setImageAttribute] = useState({});
    const [error, setError] = useState();
    const imageContainerRef = useRef();


    console.log(imageAttribute);

    

    const [searchParams, setSearchParams] = useSearchParams();

    /*  function section */
    function handleEntryInput(key, value){
        setField((prev)=>({...prev, [key]: value}));
    }

    // add custom image
    function addImageAttribute(){
        const order = imageContainerRef.current.childElementCount;
        setImageAttribute((prev)=>({
            ...prev, ["custom"]: [order, "custom"]
        }))
    }

    function renameImageAttribute(oldkey, newkey){
        setImageAttribute((prev)=> {
            const {[oldkey]: value, ...rest} = prev;
            return {...rest, [newkey]:value};
        })
    }


    /*
        fetch the attribute data from the server
    */
    useEffect(() => {
        async function fetchAttribute() {
            const uskuId = searchParams.get("id");
            const type = searchParams.get("type");

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
                setError(e);
            }
        }

        fetchAttribute();
    }, [])

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
                                            value={field.key}
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
                                    const required = value === "*" || value.includes("*")? true: false;
                                    const label = key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " ");

                                    return (
                                        <li className={styles.productAttribute} key={key}>
                                            <div className={styles.title} 
                                            style={required? {color: "red"}: {color: "black"}}
                                            >
                                                {label} {required?"*": ""}
                                            </div>
                                            <input type="text" placeholder='Type Here...' className={styles.attributeInputField} 
                                            value={field.key}
                                            onChange={(e)=>{handleEntryInput(key, e.target.value)}}
                                            />
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
                                const label = key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " ")

                                return (
                                    <li className={styles.imageCards} style={{order: value[0]}}>
                                        <input className={styles.imageTag} type="text" placeholder={label} 
                                        disabled={value.includes("custom")? false: true} 
                                        onChange={(e)=>{renameImageAttribute(key, e.target.value)}}/>

                                        <div className={styles.previewContainer}>
                                            <div className={styles.preview} style={{backgroundImage: `url("${camera}")`}}>
                                                <input type="image" style={{width: "100%", height: "100%"}}/>
                                            </div>
                                            <p className={styles.imageNote}>Required</p>
                                        </div>

                                        <input type="text" placeholder='Image link' className={styles.imageFromLink} />
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <button className={styles.moreImageBttn} onClick={addImageAttribute}>+ Add more image</button>
                </div>
            </div>
        </div>
    )
}