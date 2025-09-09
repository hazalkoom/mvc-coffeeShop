const { getDb } = require('./mongoConnection');

const COLLECTION = 'users';

async function getUsersCollection() {
	const db = getDb();
	return db.collection(COLLECTION);
}

async function createUser(user) {
	const col = await getUsersCollection();
	user.createdAt = new Date();
	const result = await col.insertOne(user);
	return { _id: result.insertedId, ...user };
}

async function findUserByEmail(email) {
	const col = await getUsersCollection();
	return col.findOne({ email });
}

async function findUserById(id) {
	const col = await getUsersCollection();
	const { ObjectId } = require('mongodb');
	return col.findOne({ _id: new ObjectId(id) });
}

async function updateUser(id, updates) {
	const col = await getUsersCollection();
	const { ObjectId } = require('mongodb');
	updates.updatedAt = new Date();
	const result = await col.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: updates },
		{ returnDocument: 'after' }
	);
	return result.value;
}

async function deleteUser(id) {
	const col = await getUsersCollection();
	const { ObjectId } = require('mongodb');
	await col.deleteOne({ _id: new ObjectId(id) });
	return true;
}

async function addCartItem(userId, productId, quantity = 1) {
	const col = await getUsersCollection();
	const { ObjectId } = require('mongodb');
	// If item exists, adjust qty by quantity (can be -1). If not, push when quantity>0.
	const user = await col.findOne({ _id: new ObjectId(userId) });
	const current = (user && Array.isArray(user.cart) ? user.cart : []).find(i => i.productId === productId);
	if (current) {
		const newQty = Number(current.quantity || 0) + Number(quantity);
		if (newQty <= 0) {
			await col.updateOne({ _id: new ObjectId(userId) }, { $pull: { cart: { productId } }, $set: { updatedAt: new Date() } });
		} else {
			await col.updateOne({ _id: new ObjectId(userId), 'cart.productId': productId }, { $set: { 'cart.$.quantity': newQty, updatedAt: new Date() } });
		}
	} else if (Number(quantity) > 0) {
		await col.updateOne({ _id: new ObjectId(userId) }, { $push: { cart: { productId, quantity: Number(quantity) } }, $set: { updatedAt: new Date() } });
	}
	return true;
}

async function getCart(userId) {
	const user = await findUserById(userId);
	return user && Array.isArray(user.cart) ? user.cart : [];
}

async function removeCartItem(userId, productId) {
	const col = await getUsersCollection();
	const { ObjectId } = require('mongodb');
	await col.updateOne(
		{ _id: new ObjectId(userId) },
		{ $pull: { cart: { productId } }, $set: { updatedAt: new Date() } }
	);
	return true;
}

async function clearCart(userId) {
	const col = await getUsersCollection();
	const { ObjectId } = require('mongodb');
	await col.updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { cart: [], updatedAt: new Date() } }
	);
	return true;
}

async function setCartItemQuantity(userId, productId, quantity) {
    const col = await getUsersCollection();
    const { ObjectId } = require('mongodb');
    const qty = Number(quantity);

    if (qty <= 0) {
        // If the new quantity is 0 or less, remove the item from the cart
        return removeCartItem(userId, productId);
    } else {
        // Otherwise, find the user and update the quantity of the specific product
        await col.updateOne(
            { _id: new ObjectId(userId), 'cart.productId': productId },
            { $set: { 'cart.$.quantity': qty, updatedAt: new Date() } }
        );
    }
    return true;
}

module.exports = {
	createUser,
	findUserByEmail,
	findUserById,
	updateUser,
	deleteUser,
	addCartItem,
	getCart,
	removeCartItem,
	clearCart,
	setCartItemQuantity
};
