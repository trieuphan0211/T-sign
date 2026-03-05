package vn.stephenphan.documentservice.dto;

import java.util.Set;

public record UserPrincipal(
        String userId,       // 'sub' claim trong JWT
        String username,     // 'preferred_username'
        String email,
        Set<String> roles
) {}
