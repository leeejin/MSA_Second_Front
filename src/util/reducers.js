export default function reducer(state, action) {
    switch (action.type) {
        case 'depError':
            return { ...state, depError: true }
        case 'arrError':
            return { ...state, arrError: true }
        case 'locationError':
            return { ...state, locationError: true }
        case 'levelError':
            return { ...state, levelError: true }
        case 'dateError':
            return { ...state, dateError: true }
        case 'searchError':
            return { ...state, searchError: true }
        case 'loginError':
            return { ...state, loginError: true }
        case 'seatError':
            return { ...state, seatError: true }
        case 'paySuccess':
            return { ...state, payError: true }
        case 'payError':
            return { ...state, payError: true }
        case 'cancelError':
            return { ...state, cancelError: true }
        case 'cancelSuccess':
            return { ...state, cancelSuccess: true }
        case 'reserveError':
            return { ...state, reserveError: true }
        case 'emailError':
            return { ...state, emailError: true }
        case 'nameError':
            return { ...state, nameError: true }
        case 'nicknameError':
            return { ...state, nicknameError: true }
        case 'passwordError':
            return { ...state, passwordError: true }
        case 'confirmPasswordError':
            return { ...state, confirmPasswordError: true }
        case 'duplicateError':
            return { ...state, duplicateError: true }
            case 'listError':
                return { ...state, listError: true }
        default:
            return {
                ...state,
                depError: false,
                arrError: false,
                locationError: false,
                levelError: false,
                dateError: false,
                searchError: false,
                loginError: false,
                seatError: false,
                paySuccess: false,
                payError: false,
                cancelError: false,
                cancelSuccess: false,
                reserveError: false,
                emailError:false,
                nameError:false,
                nicknameError:false,
                passwordError:false,
                confirmPasswordError:false,
                duplicateError:false,
                listError:false,
            }
    }
}

