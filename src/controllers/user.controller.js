import * as usersService from '../services/user.service.js';

export const getMe = async (req, res) => {
    const user = await usersService.getMe(req.userId);
    res.status(200).json({
        status: "success",
        data: user
    });
}

export const updateMe = async (req, res) => {
    const user = await usersService.updateMe(req.userId, req.body);
    res.status(200).json({
        status: "success",
        data: user
    });
}

export const deleteMe = async (req, res) => {
    await usersService.deleteMe(req.body?.password, req.userId);
    res.status(204).json({
        success: true,
        data: {}
    });
}