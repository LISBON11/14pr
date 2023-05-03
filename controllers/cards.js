const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const { HTTP_STATUS_CREATED } = require('../errors/handleErrors');
const { handleErrors } = require('../errors/handleErrors');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch((err) => handleErrors(err, res));
};

module.exports.createCard = (req, res) => {
  const ownerId = (req.user._id);
  const { name, link } = req.body;
  Card.create({ name, link, owner: ownerId })
    .then((card) => card.populate('owner'))
    .then((card) => res.status(HTTP_STATUS_CREATED).send({ data: card }))
    .catch((err) => handleErrors(err, res));
};

module.exports.deleteCard = (req, res) => {
  const { _id } = req.params.cardId;
  Card.findOne(_id)
    .populate('owner')
    .then((card) => {
      if (!card) {
        throw new NotFoundError();
      }
      if (card.owner._id.toString() !== req.user._id.toString()) {
        throw new NotFoundError('Нельзя удалить чужую карточку');
      }
      Card.findByIdAndDelete(_id)
        .populate('owner')
        .then((cardToDelete) => res.send({ data: cardToDelete }));
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        card.populate(['owner', 'likes']);
      }
      return card;
    })
    .then((card) => {
      if (!card) {
        throw new NotFoundError();
      } else {
        return res.send({ data: card });
      }
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        card.populate(['owner', 'likes']);
      }
      return card;
    })
    .then((card) => {
      if (!card) {
        throw new NotFoundError();
      } else {
        return res.send({ data: card });
      }
    })
    .catch((err) => handleErrors(err, res));
};
