export function Snowflake(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' {...props}>
      <path
        d='M19.9702 17.6801L15.4364 15.0566C15.2241 14.9343 14.9822 14.873 14.7374 14.8792C14.4925 14.8854 14.2541 14.959 14.0483 15.0918C13.8425 15.2247 13.6772 15.4117 13.5708 15.6323C13.4643 15.8529 13.4207 16.0986 13.4447 16.3424V21.4696C13.4447 21.8219 13.5846 22.1597 13.8337 22.4089C14.0828 22.658 14.4207 22.7979 14.773 22.7979C15.1248 22.7972 15.462 22.657 15.7106 22.408C15.9591 22.1589 16.0987 21.8214 16.0987 21.4696V18.5214L18.6387 19.9908C18.7903 20.0784 18.9576 20.1352 19.1312 20.1581C19.3048 20.1809 19.4812 20.1692 19.6503 20.1237C19.8193 20.0782 19.9778 19.9998 20.1165 19.893C20.2552 19.7862 20.3715 19.6531 20.4587 19.5012C20.5464 19.3496 20.6033 19.1823 20.6262 19.0086C20.6492 18.835 20.6376 18.6586 20.5923 18.4894C20.547 18.3203 20.4687 18.1617 20.362 18.0229C20.2553 17.884 20.122 17.7675 19.9702 17.6801ZM8.39862 12.3632C8.40222 12.1294 8.34329 11.8989 8.22792 11.6954C8.11255 11.492 7.94492 11.3231 7.74239 11.2063L3.16861 8.57337C2.86689 8.40053 2.50909 8.35394 2.17318 8.44376C1.83726 8.53357 1.55045 8.75251 1.37524 9.05286C1.28928 9.20185 1.23354 9.36633 1.21121 9.53689C1.18887 9.70745 1.20039 9.88074 1.24509 10.0468C1.28979 10.2129 1.3668 10.3686 1.47172 10.5049C1.57663 10.6412 1.7074 10.7555 1.85652 10.8412L4.49258 12.3575L1.85652 13.8758C1.7069 13.9609 1.57574 14.0749 1.47073 14.2113C1.36571 14.3476 1.28895 14.5036 1.24493 14.67C1.19962 14.836 1.18784 15.0094 1.21028 15.1801C1.23271 15.3507 1.28891 15.5152 1.3756 15.6639C1.55061 15.9643 1.83733 16.1834 2.17323 16.2733C2.50912 16.3632 2.86693 16.3166 3.16861 16.1437L7.74275 13.5105C7.94369 13.3941 8.11025 13.2267 8.22551 13.0251C8.34076 12.8235 8.40062 12.595 8.39898 12.3629M4.02354 6.32603L8.53972 8.93947C8.79042 9.0848 9.08185 9.14393 9.36936 9.10778C9.65687 9.07162 9.9246 8.94219 10.1315 8.73932C10.2665 8.61524 10.3741 8.46442 10.4476 8.29647C10.5211 8.12852 10.5589 7.94711 10.5584 7.76378V2.52574C10.5591 2.17465 10.4203 1.83768 10.1726 1.58892C9.92482 1.34016 9.58842 1.19998 9.23735 1.19922C9.06343 1.19945 8.89127 1.23394 8.73068 1.30072C8.5701 1.36749 8.42424 1.46524 8.30143 1.58839C8.17862 1.71153 8.08127 1.85766 8.01494 2.01843C7.9486 2.1792 7.91458 2.35146 7.91482 2.52538V5.50708L5.35003 4.02289C5.19917 3.93544 5.03254 3.87864 4.85968 3.85574C4.68682 3.83284 4.51114 3.8443 4.34272 3.88945C4.1743 3.9346 4.01645 4.01256 3.87822 4.11885C3.73999 4.22514 3.62411 4.35768 3.53722 4.50886C3.36141 4.81447 3.31388 5.17731 3.40503 5.5179C3.49618 5.85849 3.71859 6.14908 4.02354 6.32603Z'
        fill='#29B5E8'
      />
      <path
        d='M14.5161 12.2346C14.5161 12.3372 14.4571 12.479 14.384 12.5539L12.55 14.3879C12.4617 14.4671 12.3491 14.5137 12.2307 14.52H11.7638C11.6616 14.52 11.5176 14.461 11.4449 14.3879L9.60867 12.5539C9.5356 12.479 9.47656 12.3372 9.47656 12.2346V11.7677C9.47656 11.6633 9.5356 11.5215 9.60867 11.4488L11.4445 9.61258C11.5176 9.5395 11.6616 9.48047 11.7638 9.48047H12.2307C12.3333 9.48047 12.4769 9.5395 12.55 9.61258L14.384 11.4484C14.4571 11.5215 14.5161 11.6633 14.5161 11.7677V12.2346ZM12.879 12.01V11.9905C12.879 11.9157 12.8358 11.8113 12.7825 11.7558L12.2408 11.2159C12.1766 11.1565 12.0934 11.1217 12.0061 11.1176H11.9866C11.9118 11.1176 11.8074 11.1608 11.7519 11.2162L11.212 11.7562C11.1541 11.8209 11.1202 11.9035 11.1159 11.9902V12.01C11.1159 12.087 11.1591 12.1914 11.2123 12.2447L11.7523 12.7864C11.8074 12.8397 11.9118 12.8829 11.9863 12.8829H12.0061C12.0831 12.8829 12.1875 12.8397 12.2408 12.7864L12.7825 12.2447C12.8358 12.1914 12.879 12.087 12.879 12.01Z'
        fill='#29B5E8'
      />
      <path
        d='M15.4366 8.94109L19.9708 6.32765C20.1224 6.24052 20.2553 6.12433 20.3619 5.98574C20.4685 5.84715 20.5468 5.68888 20.5921 5.52001C20.6374 5.35113 20.649 5.17497 20.6262 5.00161C20.6033 4.82825 20.5465 4.66111 20.4589 4.50976C20.2818 4.20415 19.9907 3.98132 19.6494 3.89021C19.3082 3.79909 18.9447 3.84713 18.6389 4.02379L16.0986 5.4889V2.52628C16.0986 2.17432 15.9588 1.83678 15.7099 1.58791C15.461 1.33903 15.1235 1.19922 14.7715 1.19922C14.4196 1.19922 14.0821 1.33903 13.8332 1.58791C13.5843 1.83678 13.4445 2.17432 13.4445 2.52628V7.66101C13.4193 7.92739 13.4715 8.20457 13.6162 8.45512C13.7933 8.76082 14.0845 8.98372 14.4258 9.07484C14.7672 9.16597 15.1307 9.11786 15.4366 8.94109ZM9.44561 14.903C9.13493 14.8436 8.81323 14.8986 8.53993 15.0578L4.02375 17.6814C3.71835 17.859 3.49574 18.1504 3.4046 18.4917C3.31346 18.8331 3.36122 19.1966 3.53743 19.5028C3.62377 19.6546 3.73931 19.7877 3.87739 19.8945C4.01546 20.0014 4.17333 20.0798 4.34187 20.1253C4.51042 20.1708 4.68631 20.1824 4.85938 20.1595C5.03245 20.1367 5.19928 20.0798 5.35024 19.9921L7.91502 18.5032V21.4708C7.91445 21.8224 8.05347 22.1598 8.30153 22.4088C8.54958 22.6579 8.88639 22.7983 9.23791 22.7992C9.96649 22.7992 10.5586 22.2038 10.5586 21.4708V16.2159C10.5594 15.9005 10.4477 15.5952 10.2438 15.3546C10.0398 15.114 9.75687 14.9539 9.44561 14.903ZM22.6184 9.066C22.5309 8.91448 22.4144 8.78169 22.2755 8.6752C22.1367 8.56872 21.9783 8.49063 21.8093 8.4454C21.6402 8.40017 21.464 8.38868 21.2905 8.4116C21.1171 8.43451 20.9498 8.49138 20.7983 8.57895L16.2642 11.1906C16.0584 11.3091 15.8882 11.4806 15.7711 11.6871C15.654 11.8937 15.5943 12.1278 15.5982 12.3652C15.5958 12.6008 15.6562 12.8328 15.7733 13.0373C15.8903 13.2418 16.0598 13.4114 16.2642 13.5287L20.7983 16.1421C21.1045 16.3179 21.4679 16.3652 21.8089 16.2739C22.15 16.1826 22.441 15.9599 22.6184 15.6547C22.7057 15.5034 22.7624 15.3364 22.7852 15.1632C22.8079 14.9901 22.7963 14.8141 22.751 14.6454C22.7056 14.4767 22.6275 14.3186 22.521 14.1802C22.4144 14.0417 22.2817 13.9257 22.1302 13.8386L19.5629 12.3594L22.1302 10.8803C22.2819 10.7937 22.4149 10.6779 22.5216 10.5397C22.6283 10.4014 22.7066 10.2434 22.752 10.0748C22.7974 9.90612 22.8089 9.73016 22.786 9.55703C22.763 9.3839 22.7061 9.21702 22.6184 9.066Z'
        fill='#29B5E8'
      />
    </svg>
  )
}
