document.addEventListener('DOMContentLoaded', () => {
    // evita duplicar caso o footer já exista
    if (document.querySelector('.site-footer')) return;

    const footerHtml = `
    <style>
        .footer-payments .payments-icons img {
            height: 20px;
            width: auto;
            margin-right: 4px;
            vertical-align: middle;
            max-width: 32px;
        }
        .footer-payments .payments-icons {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;
            margin-top: 6px;
        }
    </style>

     <div class="ver-todos-wrapper" aria-hidden="false">
        <a href="#" class="ver-todos-btn" role="button" aria-label="Ver todos os produtos">VER TODOS
            OS
            PRODUTOS</a>
    </div>

    <!-- PARÁGRAFO DE DESCRIÇÃO DA EMPRESA-->
    <p class="descri-sobre-loja">A Loja JUVELE acredita que a moda é uma expressão de fé, propósito e estilo. Há anos no
        mercado,
        nossa missão sempre foi vestir mulheres com elegância e modéstia. Há um ano, reimaginamos nossa marca para
        atender mulheres que buscam mais do que apenas um look: elas procuram representar seus valores e essência
        através de suas escolhas. Cada peça em nossa loja é cuidadosamente selecionada para oferecer qualidade, conforto
        e beleza, sem comprometer a singularidade da moda feminina modesta e evangélica. É um prazer ser parte da sua
        jornada, ajudando você a se sentir confiante e iluminada</p>
        
    <footer class="site-footer" role="contentinfo">
        <div class="footer-logo">
            <h1>JUVELE</h1>
        </div>

        <div class="footer-body">
            <div class="footer-payments">
                <strong>Meios de pagamento:</strong>
                <span class="payments-icons">
                    <img src="assets/images/payments/visa@2x.png" alt="Visa" />
                    <img src="assets/images/payments/mastercard@2x.png" alt="Mastercard" />
                    <img src="assets/images/payments/elo@2x.png" alt="Elo" />
                    <img src="assets/images/payments/pix@2x.png" alt="Pix" />
                    <img src="assets/images/payments/hipercard@2x.png" alt="Hipercard" />
                    <img src="assets/images/payments/discover@2x.png" alt="Discover" />
                    <img src="assets/images/payments/amex@2x.png" alt="American Express" />
                    <img src="assets/images/payments/diners@2x.png" alt="Diners Club" />
                     <img src="assets/images/payments/aura@2x.png" alt="Boleto" />
                    <!-- Adicione outros ícones conforme necessário -->
                </span>
            </div>

            <div class="footer-social">
                <strong>Redes Sociais:</strong>
                <span>
                    <a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram">
                        <i class="fab fa-instagram"></i> @lojajuvele_
                    </a>
                </span>
                <span>
                    <a href="https://wa.me/5511999999999" target="_blank" rel="noopener" aria-label="WhatsApp">
                        <i class="fab fa-whatsapp"></i> Nosso WhatsApp
                    </a>
                </span>
            </div>

            <div class="footer-contact">
                <strong>Contato:</strong>
                <span><i class="fa fa-phone"></i> (11) 99999-9999</span>
                <span><i class="fa fa-envelope"></i> contato@juvele.com.br</span>
            </div>

            <div class="footer-location">
                <strong>Localização:</strong>
                <span><i class="fa fa-map-marker-alt"></i> Rua Exemplo, 123 - São Paulo, SP</span>
            </div>

            <div class="footer-dev" aria-label="Desenvolvido por">
                <div class="dev-brand">
                    <img src="assets/images/dev/dev-logo.png" alt="Logo Desenvolvedor" />
                </div>
            </div>

            <div class="footer-copyright">
                &copy; 2025 JUVELE. Todos os direitos reservados.
            </div>
        </div>
    </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHtml);

    // Redireciona ao clicar em "ver todos os produtos"
    const verTodosBtn = document.querySelector('.ver-todos-btn');
    if (verTodosBtn) {
        verTodosBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'search.html';
        });
    }
});