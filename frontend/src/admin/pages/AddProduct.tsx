import { useState } from "react"
import { adminApi } from "../utils/adminApi"

export default function AddProduct() {
  const [step, setStep] = useState(1)

  const [product, setProduct] = useState({
    name: "",
    category: "credit_cards",
    slug: ""
  })

  const [details, setDetails] = useState({
    annual_fee: "",
    joining_fee: "",
    card_network: ""
  })

  const [offers, setOffers] = useState([{ title: "", description: "" }])

  // FINAL SUBMIT
  const handleSubmit = async () => {
    // 1. Create product
    const res = await adminApi.post("/admin/products", product)

    const productId = res.data.id

    // 2. Add details
    await adminApi.post("/admin/product-details", {
      ...details,
      product_id: productId
    })

    // 3. Add offers
    await adminApi.post("/admin/product-offers", {
      product_id: productId,
      offers
    })

    alert("Product Created 🚀")
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">

      {step === 1 && (
        <div>
          <h2>Basic Info</h2>
          <input placeholder="Name"
            onChange={e => setProduct({ ...product, name: e.target.value })}
          />
          <input placeholder="Slug"
            onChange={e => setProduct({ ...product, slug: e.target.value })}
          />
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Details</h2>
          <input placeholder="Annual Fee"
            onChange={e => setDetails({ ...details, annual_fee: e.target.value })}
          />
          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Offers</h2>

          {offers.map((offer, i) => (
            <div key={i}>
              <input
                placeholder="Title"
                onChange={e => {
                  const newOffers = [...offers]
                  newOffers[i].title = e.target.value
                  setOffers(newOffers)
                }}
              />
            </div>
          ))}

          <button onClick={() =>
            setOffers([...offers, { title: "", description: "" }])
          }>
            + Add Offer
          </button>

          <button onClick={handleSubmit}>Save</button>
        </div>
      )}

    </div>
  )
}