//On créer notre moyen de payement
var stripe = Stripe('pk_test_51IS2PlEXQ5VqAecPy5BW63G61aFi0Y0QAhR9qhezBBAmJHfLgnlCvdJVEESQqh5Eopsopx1w0sguA1SMlmYOYk5000siVIfEjp');
// On créer nos vue
var app = new Vue({
    el: "#app",
    data: {
        // Sert à savoir sur quelle page on est
        page: 'list',
        boolAdd : true,
        // liste des produits
        all_products: [],
        // list du panier 
        list_panier:[],
        // Le produit qu'on consulte sur la page de détail
        currentProduct: {},
        // variable du stock de currentProduct
        currentProductSotck: {},
        // prix des produic a ajouter dans le panier
        currentProductPrice: {},
        // variable pour changer le style selon le stock
        onStockStyle:{},
        // prix du panier
        panierPrice: {},
        // nombre de copie a prendre
        nbrCopie : 1,
    },
    mounted() {
        this.getData()
    },
    methods: {
        //fonction qui sert a recuperer les donné dans la base de donné
        async getData() {
           	this.panierPrice = 0;
            // On recupère les donné de la base de donné airtable
            let response = await fetch('https://api.airtable.com/v0/appMPJMh7zqQHlI98/title?api_key=keyXNPAsgwkghT6Oe');
            let data = await response.json();
            // On affiche les donné dans la console
            console.log(data.records)
            // On sauvegarde les donnés dans un tableau
            this.all_products = data.records
        },
        //fonction qui sert à afficher la page d'un produit
        goToProduct(product) {
            window.scrollTo(0,0);
            this.currentProduct = product;
            this.page = 'detail';
            if (product.fields.stock > 0) {
                this.currentProductSotck = "En stock";
                this.onStockStyle ="onStock";
            }
            else{
                this.currentProductSotck = "Pas en stock";
                this.onStockStyle ="offStock";
            }
            this.nbrCopie = 1;
            this.setPriceDetail();
        },
        //fonction utilisé pour calculer le pri du produit quand on est sur la page du produit
        setPriceDetail(){
            if (this.nbrCopie<=0) {
                this.nbrCopie = 0;
                this.boolAdd = false;
            }
            else{
                this.boolAdd = true;
            }
            this.currentProductPrice = this.currentProduct.fields.price*this.nbrCopie;
        },
        //Fonction qui ajoute un produit au panier
        addProdPannier(){
            this.page = 'list';
            //on verifie si le produit est dans le panier
            if (this.list_panier.indexOf(this.currentProduct) !== -1) {
            	//si oui on ajoute "nbrCopie" a la quantite du produit
                this.list_panier.find(element => element == this.currentProduct).quantit = 
                parseInt(this.nbrCopie) + this.list_panier.find(element => element == this.currentProduct).quantit;
            }
            else{
                //si non on ajoute la currentProduct a la list_panier
                this.currentProduct.quantit = this.nbrCopie;
                this.list_panier.push(this.currentProduct);
            }
            addProdOnPni();
            this.calculPricePni();
        },
        //fonction qui retire un produit du panier
        deletProdPanier(product){
            //on filtre la list_panier pour enlever "product"
            this.list_panier = this.list_panier.filter(function(item){
                return item !== product
            })
            this.calculPricePni();
        },
        //fonction utilisé quand on modifie la quantité d'un produit dans le panier
        setNbrCopiPanier(product){
            if (product.quantit == 0) {
                this.deletProdPanier(product);
            }
            else{
                this.calculPricePni();
            }
        },
        // fonction qui permet de calculer le pri du panier
        calculPricePni(){
            this.panierPrice = 0;
            for (let product of this.list_panier) {
                var price = product.fields.price*product.quantit;
                this.panierPrice = this.panierPrice+price;
            }
            //on arrondi le price au deuxieme chiffre apres la virgule
            this.panierPrice = this.panierPrice.toFixed(2);
        },
        //fonction utilise quand on valide le panier
        onPay(){
        	//on créer une list vide
	        let checkout_products = [];
	        // on remplit la list avec les id_Stripe et les quantité du panier
	        for(let product of this.list_panier){
	            checkout_products.push({
	                price : product.fields.id_stripe,
	                quantity : parseInt(product.quantit),
	            })
	        }
	        onPayPni(checkout_products);


        }
    }
});
// fonction qui créer une "div" pour iformer l'utilisateur que le prod selectionner a été ajouter au panier
function addProdOnPni(){
    const addProd = document.createElement('div');
    addProd.className = 'animAddProd';
    addProd.innerHTML = "<p>Produit ajouté</p>";
    document.body.appendChild(addProd);
    setTimeout(() => {
        addProd.remove();
    }, 3000)
}
// fonction qui redirige vers la page de payement
function onPayPni(checkout_products){
    stripe.redirectToCheckout({
		// on fournit ici la liste des produits dans le panier
		lineItems: checkout_products,
		mode: 'payment',
		// la page de succès
		successUrl: 'https://e-commerce-75312555.netlify.app/succes',
		// la page d'erreur
		cancelUrl: 'https://e-commerce-75312555.netlify.app/error',
    }).then(function (result) {
		// If `redirectToCheckout` fails due to a browser or network
		// error, display the localized error message to your customer
		// using `result.error.message`.
    });
}


