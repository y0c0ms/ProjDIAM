# PriceMap: Plataforma Colaborativa de Comparação de Preços

## Sobre o Projeto
PriceMap é uma plataforma web colaborativa que permite aos utilizadores registar, consultar e comparar preços de produtos em diferentes localizações. Através de um mapa interativo e um sistema de classificação baseado na contribuição da comunidade, os utilizadores podem encontrar os melhores preços para os produtos do seu interesse.

## Funcionalidades Principais

### Para Utilizadores Não Registados
- Visualizar o mapa interativo com localizações
- Consultar preços de produtos disponíveis
- Filtrar localizações por tipo ou região
- Registar-se na plataforma

### Para Utilizadores Registados
- Adicionar novas localizações ao mapa
- Registar preços de produtos em localizações existentes
- Adicionar comentários e avaliações
- Criar listas de favoritos (produtos e localizações)
- Receber notificações sobre alterações de preços de interesse
- Enviar mensagens para outros utilizadores
- Participar em fóruns de discussão por categoria de produto
- Seguir outros utilizadores e receber atualizações

### Para Administradores
- Validar e moderar conteúdo submetido pelos utilizadores
- Gerir utilizadores e permissões
- Aceder a estatísticas e relatórios de utilização
- Gerir categorias de produtos e tipos de localizações
- Moderar fóruns e mensagens

## Tecnologias Utilizadas
- **Frontend**: React.js
- **Backend**: Django Rest Framework
- **Base de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: Token-based Authentication
- **Mapas**: Leaflet / Google Maps API

## Estrutura do Projeto
- `/PriceMapProject/frontend/` - Código fonte do frontend React
- `/PriceMapProject/backend/` - Código fonte do backend Django

## Como Executar o Projeto

### Backend
```bash
cd PriceMapProject/backend
python -m venv env
source env/bin/activate  # No Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd PriceMapProject/frontend
npm install
npm start
```

## Equipa de Desenvolvimento
Este projeto foi desenvolvido como parte da disciplina de DIAM.

## Licença
[MIT License](LICENSE) 