import Joi from 'joi';
import bcrypt from 'bcryptjs';
import  User from './user.model'
export default {
  encryptPassword(palinText) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(palinText, salt);
  },
  comparePassword(plainText, encrypedPassword) {
    return bcrypt.compareSync(plainText, encrypedPassword);
  },
  validateSignup(body, method) {

    let objSchema = {
      full_name: Joi.string().required().label('Tên nhân viên').error((errors) => {
        return {
          template: 'không được bỏ trống',
          context: {
            errors: errors.length,
            codes: errors.map((err) => err.type)
          }
        };
      }),
      role: Joi.string().required().label('Vai trò').error((errors) => {
        return {
          template: 'không được bỏ trống',
          context: {
            errors: errors.length,
            codes: errors.map((err) => err.type)
          }
        };
      }),
      email: Joi.string().label('Email')
        .email().error((errors) => {
          return {
            template: 'không đúng định dạng'
          };
        })
        .required().error((errors) => {
          return {
            template: 'không được bỏ trống'
          };
        }),

      username: Joi.string().required().label('Tài khoản').error((errors) => {
        return {
          template: 'không được bỏ trống'
        };
      }),
      password: Joi.string().required().label('Mật khẩu').error((errors) => {
        return {
          template: 'không được bỏ trống'
        };
      }),
      gender: Joi.string().allow(""),
      phone: Joi.string().required().label('Điện thoại').error((errors) => {
        return {
          template: 'không được bỏ trống'
        };
      }),
      birthday: Joi.string().allow("").allow(null)
    }

    let newSchema = {}
    if(method === 'POST'){
      newSchema = Object.assign({}, objSchema)
    }else{
      for (let key in objSchema) {
        if (objSchema.hasOwnProperty(key) && body.hasOwnProperty(key)) {
          newSchema[key] = objSchema[key]
        }
      }
    }

    let schema = Joi.object().keys(newSchema);
    const { value, error } = Joi.validate(body, schema, {allowUnknown: true , abortEarly: true});
    if (error && error.details) {
      return { error };
    }
    return { value };
  },
  validateLogin(body) {
    const schema = Joi.object().keys({
      username: Joi.string().required().label('Tài khoản').error((errors) => {
        return {
          template: 'không được bỏ trống'
        };
      }),
      password: Joi.string().required().label('Mật khẩu').error((errors) => {
        return {
          template: 'không được bỏ trống'
        };
      }),
      device_token: Joi.string().allow(null).allow('')
    });
    const { value, error } = Joi.validate(body, schema);
    if (error && error.details) {
      return { error };
    }
    return { value };
  },

  async addOrUpdateDeviceToken(nguoidung, deviceToken) {
    if (nguoidung && deviceToken) {
      let deviceTokens = nguoidung.device_tokens ? nguoidung.device_tokens : [];
      let deviceIndex = deviceTokens.indexOf(deviceToken);
      if (deviceIndex === -1) {
        deviceTokens.push(deviceToken);
        await User.findByIdAndUpdate(nguoidung._id, { device_tokens: deviceTokens }, { new: true });
      }
    }
  },
  async findAndRemoveDeviceToken(nguoidung, deviceToken) {
    if (nguoidung && deviceToken) {
      let deviceTokens = nguoidung.device_tokens ? nguoidung.device_tokens : [];
      let deviceIndex = deviceTokens.indexOf(deviceToken);
      if (deviceIndex !== -1) {
        deviceTokens.splice(deviceIndex, 1);
        await User.findByIdAndUpdate(nguoidung._id, { device_tokens: deviceTokens }, { new: true });
      }
    }
  },
};
