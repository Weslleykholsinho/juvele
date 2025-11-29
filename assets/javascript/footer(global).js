document.addEventListener('DOMContentLoaded', () => {
    // evita duplicar caso o footer já exista
    if (document.querySelector('.site-footer')) return;

    const footerHtml = `

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
                    <img src="assets/images/dev-logo.png" alt="Logo Desenvolvedor" />
                </div>
            </div>

            <div class="footer-copyright">
                &copy; 2025 JUVELE. Todos os direitos reservados.
            </div>
        </div>
    </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHtml);
});