package vn.stephenphan.certtificateservice.dto;

import lombok.Getter;

/**
 * Revocation reasons according to RFC 5280
 */
@Getter
public enum RevocationReason {
    UNSPECIFIED(0, "unspecified"),
    KEY_COMPROMISE(1, "keyCompromise"),
    CA_COMPROMISE(2, "cACompromise"),
    AFFILIATION_CHANGED(3, "affiliationChanged"),
    SUPERSEDED(4, "superseded"),
    CESSATION_OF_OPERATION(5, "cessationOfOperation"),
    CERTIFICATE_HOLD(6, "certificateHold"),
    REMOVE_FROM_CRL(8, "removeFromCRL"),
    PRIVILEGE_WITHDRAWN(9, "privilegeWithdrawn"),
    AA_COMPROMISE(10, "aACompromise");

    private final int code;
    private final String name;

    RevocationReason(int code, String name) {
        this.code = code;
        this.name = name;
    }

    public static RevocationReason fromCode(int code) {
        for (RevocationReason reason : values()) {
            if (reason.code == code) {
                return reason;
            }
        }
        return UNSPECIFIED;
    }

    public static RevocationReason fromName(String name) {
        for (RevocationReason reason : values()) {
            if (reason.name.equalsIgnoreCase(name)) {
                return reason;
            }
        }
        return UNSPECIFIED;
    }
}
