const baseUrl="https://livejs-api.hexschool.io/api/livejs/v1";
const api_path="week9-woworoom";

//初始化畫面
function init(){
  getProductsData();
  getCartsData();
}
init();


//取得產品列表
let productsData;
function getProductsData(){
  axios.get(`${baseUrl}/customer/${api_path}/products`)
  .then(function(response){
    productsData=response.data.products;
    renderProductsData(productsData);
  })
  .catch(function(error){
    console.log(error);
  })
}

//渲染產品列表
const productWrap=document.querySelector(".productWrap");
function renderProductsData(data){
  let str="";
  data.forEach(function(item){
    str+=`<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${item.images}"
      alt="${item.title}"
    />
    <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
  </li>`;
  });
  productWrap.innerHTML=str;
}

//篩選產品類別
const productSelect=document.querySelector(".productSelect");
productSelect.addEventListener("change",function(e){
  let targetItem=e.target.value;
  if(targetItem==="全部"){
    getProductsData();
  }else{
    let filterProductsData=productsData.filter(function(item){
      return item.category=== targetItem;
    })
    renderProductsData(filterProductsData);
  }
})




//取得購物車列表
let cartsData;
function getCartsData(){
  axios.get(`${baseUrl}/customer/${api_path}/carts`)
  .then(function(response){
    cartsData=response.data.carts;
    renderCartsData();
  })
  .catch(function(error){
    console.log(error);
  })
}

const cartList=document.querySelector(".cartList");
const cartTotal=document.querySelector(".cartTotal");
//渲染購物車列表
function renderCartsData(){
  let count=0;
  let str="";  
  cartsData.forEach(function(item){
    count+=item.product.price*item.quantity;
    str+=`<tr>
    <td>
    <div class="cardItem-title">
    <img src="${item.product.images}" alt="${item.product.title}" />
    <p>${item.product.title}</p>
    </div>
    </td>
    <td>NT$${item.product.price}</td>
    <td>${item.quantity}</td>
    <td>NT$${item.product.price*item.quantity}</td>
    <td class="discardBtn">
    <a href="#" class="material-icons" data-id=${item.id}> clear </a>
    </td>
    </tr>`;
  });
  cartList.innerHTML=str;
  cartTotal.textContent=`NT$${count}`;
}

//加入購物車
productWrap.addEventListener("click",function(e){
  e.preventDefault();
  let targetItem=e.target;
  if(targetItem.nodeName==="A"){
    addCart(targetItem.dataset.id);
  }else{
    return;
  }
})
function addCart(id){
  let addItemData={
    "data": {
      "productId": id,
      "quantity": 1
    }
  }
  axios.post(`${baseUrl}/customer/${api_path}/carts`,addItemData)
  .then(function(response){
    if(response.status===200){
      alert("已成功加入購物車")
    }
    getCartsData();
  })
  .catch(function(error){
    console.log(error);
  })
}

//刪除所有購物車項目
const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  if(e.target.getAttribute("class")==="discardAllBtn"){
    delAllCartsItem();
  }else{
    return;
  }
})
function delAllCartsItem(){
  axios.delete(`${baseUrl}/customer/${api_path}/carts`)
  .then(function(response){
    if(response.status===200){
      alert("成功清除所有購物車商品!");
      getCartsData();
    }
  })
  .catch(function(error){
    if(error.request.status===400){
      alert("購物車內已無商品");
    }
  })
}

//刪除單一購物車項目
cartList.addEventListener("click",function(e){
  e.preventDefault();
  delSingleCartsItem(e.target.dataset.id)
})
function delSingleCartsItem(id){
  axios.delete(`${baseUrl}/customer/${api_path}/carts/${id}`)
  .then(function(response){
    if(response.status===200){
      alert("成功刪除選擇品項!")
      getCartsData();
    }
  })
  .catch(function(error){
    console.log(error);
  })
}

//送出購買訂單
const orderInfoBtn=document.querySelector(".orderInfo-btn");
const form=document.querySelector(".orderInfo-form");
const customerName=document.querySelector("#customerName");
const customerPhone=document.querySelector("#customerPhone");
const customerEmail=document.querySelector("#customerEmail");
const customerAddress=document.querySelector("#customerAddress");
const tradeWay=document.querySelector("#tradeWay");
const errorMessage=document.querySelectorAll("[data-message]");
const input=document.querySelectorAll("input[type=text],input[type=email],input[type=tel]");
let constraints = {
  "姓名": {
    presence: {
      message: "必填"
    }
  },
  "電話": {
    presence: {
      message: "必填"
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼"
    }
  },
  "Email": {
    presence: {
      message: "必填"
    },
    email: {
      message: "格式有誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填"
    }
  },
};
//驗證
orderInfoBtn.addEventListener("click",function(e){
  e.preventDefault();
  let orderData={
    "data": {
      "user": {
        "name": customerName.value.trim(),
        "tel": customerPhone.value.trim(),
        "email": customerEmail.value.trim(),
        "address": customerAddress.value.trim(),
        "payment": tradeWay.value
      }
    }
  };
  if(validate(form, constraints)){
    errorMessage.forEach(function(item){
      item.textContent=validate(form, constraints)[item.dataset.message];
    })
  }else if(validate(form, constraints)===undefined){
    submitOrder(orderData)
  };
})
//監控所有input變化
input.forEach(function(item){
  item.addEventListener("change",function(e){
    e.preventDefault();
    item.nextElementSibling.textContent="";
  })
})
//提交訂單
function submitOrder(orderData){
  axios.post(`${baseUrl}/customer/${api_path}/orders`,orderData)
  .then(function(response){
    if(response.status===200){
      alert("成功訂單送出!");
      form.reset();
      getCartsData();
    }
  })
  .catch(function(error){
    if(error.response.status===400){
      alert("購物車內尚無商品")
    };
  })
}