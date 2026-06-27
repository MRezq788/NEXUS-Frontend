import { InputErrorMsg } from '../errors';
import type { ControlRegisterFn } from './NormalInput';
import AIAssistWrapperTextarea from '../../../aIAssistantPanel/AIAssistWrapperTextarea';

type TextAreaProps = {
  type?: string;
  placeholder: string;
  label: string;
  required?: boolean;
  name: string;
  disabled?: boolean;
  inputClassName?: string;
  wrapperClassName?: string;
  controlRegister: ControlRegisterFn;
  controlName: string;
  validations?: unknown;
  errorMsg?: string | null;
  localizedInput?: boolean;
  localization?: {
    controlRegister: ControlRegisterFn;
    controlName: string;
    placeholder: string;
    validations?: unknown;
  };
  maxLength?: number;
  flexLayout?: boolean;
  rows?: number;
};

const NormalTextArea = ({
  placeholder,
  label,
  required,
  name,
  disabled = false,
  inputClassName,
  wrapperClassName,
  localizedInput = false,
  localization,
  maxLength = 140,
  errorMsg,
  controlName,
  controlRegister,
  validations,
  flexLayout = false,
  rows = 4,
}: TextAreaProps) => {
  const inputContainerClass = localizedInput && flexLayout ? 'flex gap-4 mt-4' : 'mt-4';

  return (
    <div className={wrapperClassName || ''}>
      <label
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        htmlFor={name}
      >
        {label}
        {required && <span className="text-[#D91C12] ms-2">*</span>}
      </label>
      <div className={inputContainerClass}>
        <div className={`relative ${localizedInput && flexLayout ? 'flex-1' : ''}`}>
          {localizedInput && (
            <div className="absolute top-0 px-2 text-xs -translate-y-1/2 bg-white dark:bg-[#18191b] start-2 text-gray-700 dark:text-white font-medium">
              English
            </div>
          )}
          <textarea
            id={name}
            name={name}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            className={`w-full rounded-xl border py-3 px-4 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all resize-none ${
              inputClassName || ''
            } ${
              errorMsg
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-200 dark:border-[#2d2e33] focus:border-blue-500'
            }`}
            {...controlRegister(controlName, validations)}
          />
        </div>

        {localizedInput && (
          <div className={`relative ${flexLayout ? 'flex-1' : 'mt-4'}`}>
            <div className="absolute top-0 px-2 text-xs -translate-y-1/2 bg-white dark:bg-[#18191b] start-2 text-gray-700 dark:text-white font-medium">
              Arabic
            </div>
            <textarea
              name={name + 'localized'}
              disabled={disabled}
              placeholder={localization?.placeholder}
              maxLength={maxLength}
              rows={rows}
              className={`w-full rounded-xl border py-3 px-4 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all resize-none ${
                inputClassName || ''
              } ${
                errorMsg
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-[#2d2e33] focus:border-blue-500'
              }`}
              {...localization?.controlRegister(localization.controlName, localization.validations)}
            />
          </div>
        )}
      </div>

      {errorMsg && <InputErrorMsg>{errorMsg}</InputErrorMsg>}
    </div>
  );
};

export default NormalTextArea;

const WrappedTextArea = AIAssistWrapperTextarea(NormalTextArea);
export { WrappedTextArea };
